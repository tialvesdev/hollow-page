import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { eq } from 'drizzle-orm';
import { cadastroSchema, entrarSchema } from '@hp/shared';
import { db, schema } from '../db/index.js';
import { abrirSessao, conferirSenha, fecharSessao, hashSenha } from '../auth.js';
import { ErroHttp, rota, validar } from '../http.js';
import { config } from '../config.js';
import type { Storage } from '../storage.js';
import { usuarioPrivado } from './usuarios.js';

export function rotasAuth(s: Storage) {
  const r = Router();
  const limite = rateLimit({ windowMs: 15 * 60_000, limit: config.NODE_ENV === 'test' ? 1000 : 20, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { erro: 'Muitas tentativas. Espere alguns minutos e tente de novo.' } });

  r.post('/cadastro', limite, rota(async (req, res) => {
    const d = validar(cadastroSchema, req.body);
    const existe = await db.query.usuarios.findFirst({ where: eq(schema.usuarios.email, d.email), columns: { id: true } });
    if (existe) throw new ErroHttp(409, 'Este e-mail já tem cadastro.', { email: 'Este e-mail já tem cadastro. Entre por aqui.' });
    const [u] = await db.insert(schema.usuarios).values({ nome: d.nome, email: d.email, senhaHash: await hashSenha(d.senha), nascimento: d.nascimento }).returning();
    await abrirSessao(res, u!.id);
    res.status(201).json(await usuarioPrivado(s, u!.id));
  }));

  r.post('/entrar', limite, rota(async (req, res) => {
    const d = validar(entrarSchema, req.body);
    const u = await db.query.usuarios.findFirst({ where: eq(schema.usuarios.email, d.email) });
    // mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta
    if (!u || !(await conferirSenha(d.senha, u.senhaHash))) throw new ErroHttp(401, 'E-mail ou senha incorretos.');
    await abrirSessao(res, u.id);
    res.json(await usuarioPrivado(s, u.id));
  }));

  r.post('/sair', (_req, res) => {
    fecharSessao(res);
    res.status(204).end();
  });

  r.get('/eu', rota(async (req, res) => {
    if (!req.usuarioId) return void res.json(null);
    const u = await usuarioPrivado(s, req.usuarioId);
    if (!u) fecharSessao(res);
    res.json(u);
  }));

  return r;
}
