/* Aplica, em ordem, os arquivos .sql de ./migrations que ainda não rodaram. */
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type pg from 'pg';

const pasta = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

export async function migrar(pool: pg.Pool, log = console.log) {
  const c = await pool.connect();
  try {
    await c.query('CREATE TABLE IF NOT EXISTS _migracoes (nome text PRIMARY KEY, aplicada_em timestamptz NOT NULL DEFAULT now())');
    const feitas = new Set((await c.query<{ nome: string }>('SELECT nome FROM _migracoes')).rows.map((r) => r.nome));
    const arquivos = (await readdir(pasta)).filter((f) => f.endsWith('.sql')).sort();
    for (const a of arquivos) {
      if (feitas.has(a)) continue;
      const sql = await readFile(path.join(pasta, a), 'utf8');
      await c.query('BEGIN');
      try {
        await c.query(sql);
        await c.query('INSERT INTO _migracoes (nome) VALUES ($1)', [a]);
        await c.query('COMMIT');
        log(`migração aplicada: ${a}`);
      } catch (e) {
        await c.query('ROLLBACK');
        throw e;
      }
    }
  } finally {
    c.release();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { pool } = await import('./index.js');
  await migrar(pool);
  await pool.end();
}
