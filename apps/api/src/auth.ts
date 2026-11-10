import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { Request, Response, NextFunction } from 'express';
import { config, emProducao } from './config.js';
import { ErroHttp } from './http.js';

const COOKIE = 'hp_sessao';
const SETE_DIAS = 7 * 24 * 60 * 60;
const chave = new TextEncoder().encode(config.JWT_SECRET);

export const hashSenha = (senha: string) => bcrypt.hash(senha, emProducao ? 12 : 4);
export const conferirSenha = (senha: string, hash: string) => bcrypt.compare(senha, hash);

export async function abrirSessao(res: Response, usuarioId: string) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(usuarioId).setIssuedAt().setExpirationTime(`${SETE_DIAS}s`).sign(chave);
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: emProducao, maxAge: SETE_DIAS * 1000, path: '/' });
}

export function fecharSessao(res: Response) {
  res.clearCookie(COOKIE, { path: '/' });
}

declare module 'express-serve-static-core' {
  interface Request {
    usuarioId?: string;
  }
}

/** Lê a sessão, se houver; não bloqueia quem não está logado. */
export async function lerSessao(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (token) {
    try {
      const { payload } = await jwtVerify(token, chave, { algorithms: ['HS256'] });
      req.usuarioId = payload.sub;
    } catch {
      /* sessão expirada ou inválida: segue como visitante */
    }
  }
  next();
}

export function exigirLogin(req: Request) {
  if (!req.usuarioId) throw new ErroHttp(401, 'Entre na sua conta para continuar.');
  return req.usuarioId;
}
