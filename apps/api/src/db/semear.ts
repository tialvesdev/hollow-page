/* Lógica comum aos seeds de desenvolvimento e de produção: cria contas, publicações e salvos
   a partir de listas fixas. Só mexe nas contas da lista (pelo e-mail); o resto do banco fica como está. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from './index.js';
import { migrar } from './migrate.js';
import { hashSenha } from '../auth.js';
import { prepararImagem } from '../imagens.js';
import { criarStorage } from '../storage.js';

export type Pessoa = { k: string; nome: string; capa: string; bio: string; link: string; foto?: string };
/** [arquivo sem extensão, conta, título, descrição, atributos, data em horário de Brasília] */
export type Publicacao = [string, string, string, string, string[], string];

export async function semear(o: {
  pessoas: Pessoa[];
  posts: Publicacao[];
  /** quantas pessoas salvam cada publicação, na mesma ordem de `posts` */
  salvosPorPost: number[];
  senha: string;
  dominio: string;
  pasta: string;
  /** prefixo das chaves no storage, para não colidir com outros seeds */
  prefixo: string;
  forcar: boolean;
}) {
  await migrar(pool);
  const emails = o.pessoas.map((p) => `${p.k}@${o.dominio}`);
  const { rows: existentes } = await pool.query<{ id: string }>('SELECT id FROM usuarios WHERE email = ANY($1::text[])', [emails]);
  if (existentes.length && !o.forcar) {
    console.log('As contas de exemplo já existem. Rode com --forcar para apagá-las e recriar (o resto do banco não é tocado).');
    return false;
  }
  if (existentes.length) await pool.query('DELETE FROM usuarios WHERE email = ANY($1::text[])', [emails]); // posts e salvos saem em cascata

  const s = criarStorage();
  const senha = await hashSenha(o.senha);
  const ids: Record<string, string> = {};
  for (const p of o.pessoas) {
    let fotoChave: string | null = null;
    if (p.foto) {
      const img = await prepararImagem(await readFile(path.join(o.pasta, `${p.foto}.webp`)), 'avatar');
      fotoChave = `avatares/${o.prefixo}-${p.k}.webp`;
      await s.salvar(fotoChave, img.dados, 'image/webp');
    }
    const r = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, capa, bio, link, foto_chave) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [p.nome, `${p.k}@${o.dominio}`, senha, p.capa, p.bio, p.link, fotoChave],
    );
    ids[p.k] = r.rows[0].id;
  }

  const postIds: string[] = [];
  for (const [arq, autor, titulo, desc, tags, data] of o.posts) {
    const img = await prepararImagem(await readFile(path.join(o.pasta, `${arq}.webp`)), 'post');
    const chave = `posts/${o.prefixo}-${arq}.webp`;
    await s.salvar(chave, img.dados, 'image/webp');
    const r = await pool.query(
      `INSERT INTO posts (autor_id, titulo, descricao, imagem_chave, largura, altura, criado_em) VALUES ($1,$2,$3,$4,$5,$6,$7::timestamp AT TIME ZONE 'America/Sao_Paulo') RETURNING id`,
      [ids[autor], titulo, desc, chave, img.largura, img.altura, data],
    );
    postIds.push(r.rows[0].id);
    await pool.query('INSERT INTO post_tags (post_id, tag_id) SELECT $1, id FROM tags WHERE nome = ANY($2::text[])', [r.rows[0].id, tags]);
  }

  // salvos: quem salva cada arte varia; ninguém salva a própria
  const todos = o.pessoas.map((p) => p.k);
  for (const [i, pid] of postIds.entries()) {
    const autor = o.posts[i]![1];
    const outros = todos.filter((k) => k !== autor);
    const n = Math.min(o.salvosPorPost[i] ?? 0, outros.length);
    for (let j = 0; j < n; j++) {
      const quem = outros[(i + j * 2) % outros.length]!;
      await pool.query('INSERT INTO salvos (usuario_id, post_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [ids[quem], pid]);
    }
  }
  console.log(`Exemplos criados: ${o.pessoas.length} pessoas e ${o.posts.length} publicações.`);
  return true;
}
