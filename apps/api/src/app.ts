import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from './config.js';
import { lerSessao } from './auth.js';
import { ErroHttp, tratarErros } from './http.js';
import { criarStorage, type Storage } from './storage.js';
import { rotasAuth } from './routes/auth.js';
import { rotasUsuarios } from './routes/usuarios.js';
import { rotasPosts, rotaTags } from './routes/posts.js';

export function criarApp(storage: Storage = criarStorage()) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', ...(config.S3_PUBLIC_URL ? [new URL(config.S3_PUBLIC_URL).origin] : [])],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        },
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // pedidos que mudam dados precisam vir do próprio site
  app.use('/api', (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origem = req.get('origin');
    if (origem && new URL(origem).host !== req.get('host')) return next(new ErroHttp(403, 'Origem não permitida.'));
    next();
  });
  app.use('/api', lerSessao);
  app.get('/api/saude', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', rotasAuth(storage));
  app.use('/api/usuarios', rotasUsuarios(storage));
  app.use('/api/posts', rotasPosts(storage));
  app.use('/api/tags', rotaTags);
  app.use('/api', (_req, _res, next) => next(new ErroHttp(404, 'Rota não encontrada.')));

  if (config.STORAGE === 'local') app.use('/uploads', express.static(path.resolve(config.UPLOAD_DIR), { maxAge: '30d', immutable: true }));

  // em produção, o mesmo servidor entrega o front (React)
  const web = config.WEB_DIST ?? path.resolve(process.cwd(), '../web/dist');
  if (existsSync(web)) {
    app.use(express.static(web, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => res.sendFile(path.join(web, 'index.html')));
  }

  app.use(tratarErros);
  return app;
}
