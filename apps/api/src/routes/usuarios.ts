import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { perfilSchema, LIMITES, type UsuarioPrivado, type UsuarioPublico, type CapaId } from '@hp/shared';
import { db, schema, pool } from '../db/index.js';
import { conferirSenha, exigirLogin, fecharSessao } from '../auth.js';
import { ErroHttp, rota, validar } from '../http.js';
import { prepararImagem } from '../imagens.js';
import { estatisticas, listarPosts } from '../repo.js';
import { listarPostsSchema } from '@hp/shared';
import type { Storage } from '../storage.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITES.imagemMB * 1024 * 1024, files: 1 },
  fileFilter: (_req, f, cb) => cb(null, /^image\/(jpeg|png|webp|gif|avif)$/.test(f.mimetype)),
});

async function linhaUsuario(id: string) {
  const u = await db.query.usuarios.findFirst({ where: eq(schema.usuarios.id, id) });
  if (!u) return null;
  const [{ n }] = (await db.select({ n: sql<number>`count(*)::int` }).from(schema.posts).where(eq(schema.posts.autorId, id))) as [{ n: number }];
  return { u, n };
}

export async function usuarioPublico(s: Storage, id: string): Promise<UsuarioPublico | null> {
  const l = await linhaUsuario(id);
  if (!l) return null;
  return { id: l.u.id, nome: l.u.nome, fotoUrl: l.u.fotoChave ? s.url(l.u.fotoChave) : null, capa: l.u.capa as CapaId, publicacoes: l.n };
}

export async function usuarioPrivado(s: Storage, id: string): Promise<UsuarioPrivado | null> {
  const l = await linhaUsuario(id);
  if (!l) return null;
  return {
    id: l.u.id, nome: l.u.nome, fotoUrl: l.u.fotoChave ? s.url(l.u.fotoChave) : null, capa: l.u.capa as CapaId, publicacoes: l.n,
    email: l.u.email, nascimento: l.u.nascimento, genero: l.u.genero as UsuarioPrivado['genero'], telefone: l.u.telefone,
  };
}

const UUID = /^[0-9a-f-]{36}$/i;

export function rotasUsuarios(s: Storage) {
  const r = Router();

  r.patch('/eu', rota(async (req, res) => {
    const id = exigirLogin(req);
    const d = validar(perfilSchema, req.body);
    if (d.email) {
      const outro = await db.query.usuarios.findFirst({ where: eq(schema.usuarios.email, d.email), columns: { id: true } });
      if (outro && outro.id !== id) throw new ErroHttp(409, 'Este e-mail já está em uso.', { email: 'Este e-mail já está em uso por outra conta.' });
    }
    if (Object.keys(d).length) await db.update(schema.usuarios).set(d).where(eq(schema.usuarios.id, id));
    res.json(await usuarioPrivado(s, id));
  }));

  r.put('/eu/foto', upload.single('foto'), rota(async (req, res) => {
    const id = exigirLogin(req);
    if (!req.file) throw new ErroHttp(400, 'Escolha uma imagem para a foto de perfil.', { foto: 'Escolha uma imagem JPG, PNG, WebP ou GIF.' });
    const { dados } = await prepararImagem(req.file.buffer, 'avatar');
    const chave = `avatares/${id}-${randomUUID().slice(0, 8)}.webp`;
    await s.salvar(chave, dados, 'image/webp');
    const antes = await db.query.usuarios.findFirst({ where: eq(schema.usuarios.id, id), columns: { fotoChave: true } });
    await db.update(schema.usuarios).set({ fotoChave: chave }).where(eq(schema.usuarios.id, id));
    if (antes?.fotoChave) await s.apagar(antes.fotoChave);
    res.json(await usuarioPrivado(s, id));
  }));

  r.delete('/eu', rota(async (req, res) => {
    const id = exigirLogin(req);
    const u = await db.query.usuarios.findFirst({ where: eq(schema.usuarios.id, id) });
    if (!u) throw new ErroHttp(404, 'Conta não encontrada.');
    if (!(await conferirSenha(String(req.body?.senha ?? ''), u.senhaHash)))
      throw new ErroHttp(403, 'Senha incorreta.', { senha: 'Digite a senha atual para confirmar a exclusão.' });
    const { rows } = await pool.query<{ imagem_chave: string }>('SELECT imagem_chave FROM posts WHERE autor_id = $1', [id]);
    await db.delete(schema.usuarios).where(eq(schema.usuarios.id, id));
    await Promise.all([...rows.map((x) => s.apagar(x.imagem_chave)), u.fotoChave ? s.apagar(u.fotoChave) : null]);
    fecharSessao(res);
    res.status(204).end();
  }));

  r.get('/eu/salvos', rota(async (req, res) => {
    const id = exigirLogin(req);
    const f = validar(listarPostsSchema, req.query);
    res.json(await listarPosts(s, { leitor: id, salvosDe: id, cursor: f.cursor, limite: f.limite }));
  }));

  r.get('/eu/estatisticas', rota(async (req, res) => {
    res.json(await estatisticas(s, exigirLogin(req)));
  }));

  r.get('/:id', rota(async (req, res) => {
    const u = UUID.test(req.params.id!) ? await usuarioPublico(s, req.params.id!) : null;
    if (!u) throw new ErroHttp(404, 'Perfil não encontrado.');
    res.json(u);
  }));

  r.get('/:id/posts', rota(async (req, res) => {
    if (!UUID.test(req.params.id!)) throw new ErroHttp(404, 'Perfil não encontrado.');
    const f = validar(listarPostsSchema, req.query);
    res.json(await listarPosts(s, { leitor: req.usuarioId, autorId: req.params.id, cursor: f.cursor, limite: f.limite }));
  }));

  return r;
}
