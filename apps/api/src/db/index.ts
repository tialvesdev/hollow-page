import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '../config.js';
import * as schema from './schema.js';

/* node-postgres com pool: o servidor Express fica rodando e reaproveita as conexões entre pedidos.
   No Neon, DATABASE_URL é a URL com pooler (-pooler) e o certificado é verificado. */
const ssl = config.DATABASE_SSL === 'true' ? true : undefined;
export const criarPool = (url: string, max = 10) => new pg.Pool({ connectionString: url, ssl, max, idleTimeoutMillis: 30_000 });

export const pool = criarPool(config.DATABASE_URL);

export const db = drizzle(pool, { schema });
export type Db = typeof db;
export { schema };
