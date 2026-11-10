import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, type ZodTypeAny, type z } from 'zod';

export class ErroHttp extends Error {
  constructor(public status: number, message: string, public campos?: Record<string, string>) {
    super(message);
  }
}

/** Repassa erros de handlers assíncronos para o tratador central. */
export const rota =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function validar<T extends ZodTypeAny>(schema: T, dados: unknown): z.infer<T> {
  const r = schema.safeParse(dados);
  if (r.success) return r.data;
  throw zodParaErro(r.error);
}

export function zodParaErro(e: ZodError) {
  const campos: Record<string, string> = {};
  for (const i of e.issues) {
    const k = i.path.join('.') || '_';
    if (!campos[k]) campos[k] = i.message;
  }
  return new ErroHttp(400, 'Confira os campos destacados.', campos);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tratarErros(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ErroHttp) {
    res.status(err.status).json({ erro: err.message, campos: err.campos });
    return;
  }
  if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ erro: 'A imagem passa do limite de 8 MB. Escolha um arquivo menor.' });
    return;
  }
  console.error(err);
  res.status(500).json({ erro: 'Não foi possível concluir agora. Tente de novo em instantes.' });
}
