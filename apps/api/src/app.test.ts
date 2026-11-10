import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import { pool } from './db/index.js';
import { migrar } from './db/migrate.js';
import { criarApp } from './app.js';
import type { Storage } from './storage.js';

const arquivos = new Map<string, Buffer>();
const storage: Storage = {
  async salvar(k, d) { arquivos.set(k, d); },
  async apagar(k) { arquivos.delete(k); },
  async ler(k) { const d = arquivos.get(k); if (!d) throw new Error('não existe'); return d; },
  url: (k) => `/uploads/${k}`,
};
const app = criarApp(storage);
let png: Buffer;

beforeAll(async () => {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await migrar(pool, () => undefined);
  png = await sharp({ create: { width: 900, height: 600, channels: 3, background: '#69E2EE' } }).png().toBuffer();
});
afterAll(() => pool.end());

const novo = (nome = 'Fulano da Silva', email = 'fulano@email.com') => ({ nome, email, senha: '123456', nascimento: '1999-02-03' });

describe('cadastro e sessão', () => {
  it('rejeita dados inválidos com mensagens por campo', async () => {
    const r = await request(app).post('/api/auth/cadastro').send({ nome: 'A', email: 'x', senha: '1', nascimento: '' });
    expect(r.status).toBe(400);
    expect(Object.keys(r.body.campos)).toEqual(expect.arrayContaining(['nome', 'email', 'senha', 'nascimento']));
  });

  it('cadastra, guarda a senha com hash e abre sessão em cookie httpOnly', async () => {
    const r = await request(app).post('/api/auth/cadastro').send(novo());
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ nome: 'Fulano da Silva', email: 'fulano@email.com', capa: 'o-cavaleiro', publicacoes: 0 });
    expect(r.headers['set-cookie']?.[0]).toMatch(/hp_sessao=.*HttpOnly/);
    const { rows } = await pool.query('SELECT senha_hash FROM usuarios');
    expect(rows[0].senha_hash).not.toBe('123456');
  });

  it('não deixa repetir e-mail', async () => {
    const r = await request(app).post('/api/auth/cadastro').send(novo('Outra', 'FULANO@email.com'));
    expect(r.status).toBe(409);
  });

  it('entra com a senha certa e recusa a errada com mensagem genérica', async () => {
    expect((await request(app).post('/api/auth/entrar').send({ email: 'fulano@email.com', senha: 'errada' })).body.erro).toBe('E-mail ou senha incorretos.');
    expect((await request(app).post('/api/auth/entrar').send({ email: 'nao@existe.com', senha: '123456' })).body.erro).toBe('E-mail ou senha incorretos.');
    const ag = request.agent(app);
    expect((await ag.post('/api/auth/entrar').send({ email: 'fulano@email.com', senha: '123456' })).status).toBe(200);
    expect((await ag.get('/api/auth/eu')).body.email).toBe('fulano@email.com');
    await ag.post('/api/auth/sair');
    expect((await ag.get('/api/auth/eu')).body).toBeNull();
  });

  it('bloqueia mudanças vindas de outro site', async () => {
    const r = await request(app).post('/api/auth/entrar').set('Origin', 'https://site-malicioso.com').send({ email: 'fulano@email.com', senha: '123456' });
    expect(r.status).toBe(403);
  });
});

describe('publicações, filtro, salvos e perfil', () => {
  const fulano = request.agent(app);
  const lira = request.agent(app);
  let postId = '';

  beforeAll(async () => {
    await fulano.post('/api/auth/entrar').send({ email: 'fulano@email.com', senha: '123456' });
    await lira.post('/api/auth/cadastro').send(novo('Lira Moraes', 'lira@email.com'));
  });

  it('exige login para publicar', async () => {
    expect((await request(app).post('/api/posts').field('titulo', 'x').attach('imagem', png, 'a.png')).status).toBe(401);
  });

  it('exige imagem e título', async () => {
    const r = await fulano.post('/api/posts').field('titulo', '');
    expect(r.status).toBe(400);
  });

  it('publica com imagem convertida em WebP e atributos', async () => {
    const r = await fulano.post('/api/posts').field('titulo', 'Musgo e silêncio').field('descricao', 'Na Trilha Verde.').field('tags', 'Cavaleiro,Trilha Verde').attach('imagem', png, 'arte.png');
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ titulo: 'Musgo e silêncio', largura: 900, altura: 600, tags: ['Cavaleiro', 'Trilha Verde'], salvos: 0 });
    expect(r.body.imagemUrl).toMatch(/^\/uploads\/posts\/.+\.webp$/);
    postId = r.body.id;
    await lira.post('/api/posts').field('titulo', 'Amigos de papel').field('tags', 'Hornet').attach('imagem', png, 'b.png');
  });

  it('rejeita arquivo que não é imagem', async () => {
    const r = await fulano.post('/api/posts').field('titulo', 'falso').attach('imagem', Buffer.from('não sou imagem'), { filename: 'x.png', contentType: 'image/png' });
    expect(r.status).toBe(400);
  });

  it('lista o mural do mais novo ao mais antigo, filtra por atributo e pesquisa', async () => {
    const todos = await request(app).get('/api/posts');
    expect(todos.body.itens.map((p: { titulo: string }) => p.titulo)).toEqual(['Amigos de papel', 'Musgo e silêncio']);
    const hornet = await request(app).get('/api/posts?tags=Hornet');
    expect(hornet.body.itens).toHaveLength(1);
    const busca = await request(app).get('/api/posts?q=lira');
    expect(busca.body.itens[0].autor.nome).toBe('Lira Moraes');
    expect((await request(app).get('/api/posts?tags=Inexistente')).status).toBe(400);
  });

  it('pagina com cursor', async () => {
    const p1 = await request(app).get('/api/posts?limite=1');
    expect(p1.body.proximo).toBeTruthy();
    const p2 = await request(app).get(`/api/posts?limite=1&cursor=${p1.body.proximo}`);
    expect(p2.body.itens[0].id).not.toBe(p1.body.itens[0].id);
    expect(p2.body.proximo).toBeNull();
  });

  it('salva e remove dos salvos', async () => {
    const s = await lira.put(`/api/posts/${postId}/salvo`);
    expect(s.body).toMatchObject({ salvos: 1, salvoPorMim: true });
    expect((await lira.get('/api/usuarios/eu/salvos')).body.itens).toHaveLength(1);
    const d = await lira.delete(`/api/posts/${postId}/salvo`);
    expect(d.body).toMatchObject({ salvos: 0, salvoPorMim: false });
    await lira.put(`/api/posts/${postId}/salvo`);
  });

  it('mostra estatísticas de quem publicou', async () => {
    const r = await fulano.get('/api/usuarios/eu/estatisticas');
    expect(r.body.totalSalvos).toBe(1);
    expect(r.body.porDia[0].publicacoes).toBe(1);
    expect(r.body.maisSalvo.id).toBe(postId);
  });

  it('baixa a imagem como anexo', async () => {
    const r = await request(app).get(`/api/posts/${postId}/baixar`);
    expect(r.status).toBe(200);
    expect(r.headers['content-disposition']).toContain('musgo-e-silencio.webp');
  });

  it('edita o perfil e troca a foto', async () => {
    const r = await fulano.patch('/api/usuarios/eu').send({ genero: 'M', telefone: '(11) 90000-0000', capa: 'pico-de-cristal' });
    expect(r.body).toMatchObject({ genero: 'M', capa: 'pico-de-cristal' });
    expect((await fulano.patch('/api/usuarios/eu').send({ capa: 'inexistente' })).status).toBe(400);
    expect((await fulano.patch('/api/usuarios/eu').send({ email: 'lira@email.com' })).status).toBe(409);
    const f = await fulano.put('/api/usuarios/eu/foto').attach('foto', png, 'eu.png');
    expect(f.body.fotoUrl).toMatch(/^\/uploads\/avatares\//);
  });

  it('não deixa apagar publicação de outra pessoa', async () => {
    expect((await lira.delete(`/api/posts/${postId}`)).status).toBe(403);
  });

  it('exclui a conta só com a senha certa e leva as publicações junto', async () => {
    expect((await fulano.delete('/api/usuarios/eu').send({ senha: 'errada' })).status).toBe(403);
    expect((await fulano.delete('/api/usuarios/eu').send({ senha: '123456' })).status).toBe(204);
    const r = await request(app).get('/api/posts');
    expect(r.body.itens.map((p: { titulo: string }) => p.titulo)).toEqual(['Amigos de papel']);
    expect([...arquivos.keys()].some((k) => k.startsWith('avatares/'))).toBe(false);
  });
});
