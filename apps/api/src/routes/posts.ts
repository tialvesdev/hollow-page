import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { novoPostSchema, listarPostsSchema, TAGS } from '@hp/shared';
import { db, schema } from '../db/index.js';
import { exigirLogin } from '../auth.js';
import { ErroHttp, rota, validar } from '../http.js';
import { prepararImagem } from '../imagens.js';
import { buscarPost, listarPosts } from '../repo.js';
import { upload } from './usuarios.js';
import type { Storage } from '../storage.js';

export function rotasPosts(s: Storage) {
  const r = Router();

  r.get('/', rota(async (req, res) => {
    const f = validar(listarPostsSchema, req.query);
    res.json(await listarPosts(s, { leitor: req.usuarioId, q: f.q, tags: f.tags, cursor: f.cursor, limite: f.limite }));
  }));

  r.get('/:id', rota(async (req, res) => {
    const p = await buscarPost(s, req.params.id!, req.usuarioId);
    if (!p) throw new ErroHttp(404, 'Publicação não encontrada.');
    res.json(p);
  }));

  r.post('/', upload.single('imagem'), rota(async (req, res) => {
    const autorId = exigirLogin(req);
    const tags = ([] as string[]).concat(req.body?.tags ?? []).flatMap((t) => String(t).split(',')).filter(Boolean);
    const d = validar(novoPostSchema, { titulo: req.body?.titulo, descricao: req.body?.descricao ?? '', tags: [...new Set(tags)] });
    if (!req.file) throw new ErroHttp(400, 'Escolha uma imagem para publicar.', { imagem: 'Escolha uma imagem JPG, PNG, WebP ou GIF de até 8 MB.' });
    const img = await prepararImagem(req.file.buffer, 'post');
    const chave = `posts/${randomUUID()}.webp`;
    await s.salvar(chave, img.dados, 'image/webp');
    try {
      const id = await db.transaction(async (tx) => {
        const [p] = await tx.insert(schema.posts).values({ autorId, titulo: d.titulo, descricao: d.descricao, imagemChave: chave, largura: img.largura, altura: img.altura }).returning({ id: schema.posts.id });
        if (d.tags.length) {
          const ts = await tx.select().from(schema.tags).where(inArray(schema.tags.nome, d.tags));
          await tx.insert(schema.postTags).values(ts.map((t) => ({ postId: p!.id, tagId: t.id })));
        }
        return p!.id;
      });
      res.status(201).json(await buscarPost(s, id, autorId));
    } catch (e) {
      await s.apagar(chave);
      throw e;
    }
  }));

  r.delete('/:id', rota(async (req, res) => {
    const id = exigirLogin(req);
    const p = await buscarPost(s, req.params.id!);
    if (!p) throw new ErroHttp(404, 'Publicação não encontrada.');
    if (p.autor.id !== id) throw new ErroHttp(403, 'Só quem publicou pode apagar esta publicação.');
    const [del] = await db.delete(schema.posts).where(eq(schema.posts.id, p.id)).returning({ chave: schema.posts.imagemChave });
    if (del) await s.apagar(del.chave);
    res.status(204).end();
  }));

  r.put('/:id/salvo', rota(async (req, res) => {
    const id = exigirLogin(req);
    const p = await buscarPost(s, req.params.id!);
    if (!p) throw new ErroHttp(404, 'Publicação não encontrada.');
    await db.insert(schema.salvos).values({ usuarioId: id, postId: p.id }).onConflictDoNothing();
    res.json(await buscarPost(s, p.id, id));
  }));

  r.delete('/:id/salvo', rota(async (req, res) => {
    const id = exigirLogin(req);
    const p = await buscarPost(s, req.params.id!);
    if (!p) throw new ErroHttp(404, 'Publicação não encontrada.');
    await db.delete(schema.salvos).where(and(eq(schema.salvos.usuarioId, id), eq(schema.salvos.postId, p.id)));
    res.json(await buscarPost(s, p.id, id));
  }));

  r.get('/:id/baixar', rota(async (req, res) => {
    const p = await db.query.posts.findFirst({ where: eq(schema.posts.id, /^[0-9a-f-]{36}$/i.test(req.params.id!) ? req.params.id! : '00000000-0000-0000-0000-000000000000') });
    if (!p) throw new ErroHttp(404, 'Publicação não encontrada.');
    const dados = await s.ler(p.imagemChave);
    const nome = p.titulo.normalize('NFD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'hollow-page';
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Disposition', `attachment; filename="${nome}.webp"`);
    res.send(dados);
  }));

  return r;
}

export const rotaTags = Router().get('/', (_req, res) => res.json(TAGS));
