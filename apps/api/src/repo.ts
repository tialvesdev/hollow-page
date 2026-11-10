/* Consultas de leitura que juntam várias tabelas (mural, perfil, estatísticas). */
import type { Post, Tag } from '@hp/shared';
import { pool } from './db/index.js';
import type { Storage } from './storage.js';

interface LinhaPost {
  id: string; titulo: string; descricao: string; imagem_chave: string; largura: number; altura: number; criado_em: Date;
  autor_id: string; autor_nome: string; autor_foto: string | null; tags: string[]; salvos: number; salvo_por_mim: boolean;
}

export const paraPost = (s: Storage) => (l: LinhaPost): Post => ({
  id: l.id,
  titulo: l.titulo,
  descricao: l.descricao,
  imagemUrl: s.url(l.imagem_chave),
  largura: l.largura,
  altura: l.altura,
  tags: l.tags as Tag[],
  criadoEm: l.criado_em.toISOString(),
  salvos: l.salvos,
  salvoPorMim: l.salvo_por_mim,
  autor: { id: l.autor_id, nome: l.autor_nome, fotoUrl: l.autor_foto ? s.url(l.autor_foto) : null },
});

const SELECT = `
  SELECT p.id, p.titulo, p.descricao, p.imagem_chave, p.largura, p.altura, p.criado_em,
         u.id AS autor_id, u.nome AS autor_nome, u.foto_chave AS autor_foto,
         COALESCE((SELECT array_agg(t.nome ORDER BY t.id) FROM post_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id), '{}') AS tags,
         (SELECT count(*)::int FROM salvos s WHERE s.post_id = p.id) AS salvos,
         EXISTS (SELECT 1 FROM salvos s WHERE s.post_id = p.id AND s.usuario_id = $1::uuid) AS salvo_por_mim
  FROM posts p JOIN usuarios u ON u.id = p.autor_id`;

export interface FiltroPosts {
  leitor?: string;
  q?: string;
  tags?: string[];
  autorId?: string;
  salvosDe?: string;
  cursor?: string;
  limite: number;
}

const codificar = (d: Date, id: string) => Buffer.from(`${d.toISOString()}|${id}`).toString('base64url');
function decodificar(c: string): [string, string] | null {
  const [t, id] = Buffer.from(c, 'base64url').toString().split('|');
  if (!t || !id || Number.isNaN(Date.parse(t)) || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  return [t, id];
}

export async function listarPosts(s: Storage, f: FiltroPosts) {
  const params: unknown[] = [f.leitor ?? null];
  const onde: string[] = [];
  const p = (v: unknown) => (params.push(v), `$${params.length}`);
  if (f.autorId) onde.push(`p.autor_id = ${p(f.autorId)}::uuid`);
  if (f.salvosDe) onde.push(`EXISTS (SELECT 1 FROM salvos sv WHERE sv.post_id = p.id AND sv.usuario_id = ${p(f.salvosDe)}::uuid)`);
  if (f.tags?.length) {
    onde.push(`p.id IN (SELECT pt.post_id FROM post_tags pt JOIN tags t ON t.id = pt.tag_id WHERE t.nome = ANY(${p(f.tags)}::text[])
      GROUP BY pt.post_id HAVING count(DISTINCT t.nome) = ${p(f.tags.length)})`);
  }
  if (f.q) {
    const termo = `%${f.q.replace(/[\\%_]/g, (m) => '\\' + m)}%`;
    const i = p(termo);
    onde.push(`(p.titulo ILIKE ${i} OR p.descricao ILIKE ${i} OR u.nome ILIKE ${i})`);
  }
  if (f.cursor) {
    const c = decodificar(f.cursor);
    if (c) onde.push(`(p.criado_em, p.id) < (${p(c[0])}::timestamptz, ${p(c[1])}::uuid)`);
  }
  const sql = `${SELECT} ${onde.length ? 'WHERE ' + onde.join(' AND ') : ''}
    ORDER BY p.criado_em DESC, p.id DESC LIMIT ${p(f.limite + 1)}`;
  const { rows } = await pool.query<LinhaPost>(sql, params);
  const mais = rows.length > f.limite;
  const itens = rows.slice(0, f.limite);
  const ultimo = itens[itens.length - 1];
  return { itens: itens.map(paraPost(s)), proximo: mais && ultimo ? codificar(ultimo.criado_em, ultimo.id) : null };
}

export async function buscarPost(s: Storage, id: string, leitor?: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await pool.query<LinhaPost>(`${SELECT} WHERE p.id = $2::uuid`, [leitor ?? null, id]);
  return rows[0] ? paraPost(s)(rows[0]) : null;
}

export async function estatisticas(s: Storage, usuarioId: string) {
  const { rows: porDia } = await pool.query<{ dia: string; publicacoes: number }>(
    `SELECT to_char(date_trunc('day', criado_em AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') AS dia, count(*)::int AS publicacoes
     FROM posts WHERE autor_id = $1 GROUP BY 1 ORDER BY 1 DESC LIMIT 14`,
    [usuarioId],
  );
  const { rows } = await pool.query<LinhaPost>(
    `${SELECT} WHERE p.autor_id = $1::uuid ORDER BY salvos DESC, p.criado_em DESC`,
    [usuarioId],
  );
  const lista = rows.map(paraPost(s));
  return {
    totalSalvos: lista.reduce((t, p) => t + p.salvos, 0),
    porDia: porDia.reverse(),
    maisSalvo: lista[0] ?? null,
    menosSalvo: lista.length > 1 ? lista[lista.length - 1]! : null,
  };
}
