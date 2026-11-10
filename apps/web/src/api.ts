import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UsuarioPrivado, UsuarioPublico, Post, PaginaPosts, Estatisticas, ErroApi } from '@hp/shared';

export class ErroRequisicao extends Error {
  constructor(public status: number, public dados: ErroApi) {
    super(dados.erro);
  }
}

export async function api<T>(caminho: string, opcoes: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...resto } = opcoes;
  const r = await fetch(`/api${caminho}`, {
    credentials: 'same-origin',
    ...resto,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : resto.body,
  });
  if (r.status === 204) return undefined as T;
  const dados = await r.json().catch(() => ({ erro: 'Resposta inesperada do servidor.' }));
  if (!r.ok) throw new ErroRequisicao(r.status, dados as ErroApi);
  return dados as T;
}

export const chaves = {
  eu: ['eu'] as const,
  mural: (q: string, tags: string[]) => ['mural', q, tags.join(',')] as const,
  post: (id: string) => ['post', id] as const,
  usuario: (id: string) => ['usuario', id] as const,
  postsDe: (id: string) => ['postsDe', id] as const,
  salvos: ['salvos'] as const,
  estatisticas: ['estatisticas'] as const,
};

export function useEu() {
  return useQuery({ queryKey: chaves.eu, queryFn: () => api<UsuarioPrivado | null>('/auth/eu'), staleTime: 60_000 });
}

export function usePost(id: string | null) {
  return useQuery({ queryKey: chaves.post(id ?? ''), queryFn: () => api<Post>(`/posts/${id}`), enabled: !!id });
}

export function useUsuario(id: string | undefined) {
  return useQuery({ queryKey: chaves.usuario(id ?? ''), queryFn: () => api<UsuarioPublico>(`/usuarios/${id}`), enabled: !!id });
}

export function useEstatisticas(ativo: boolean) {
  return useQuery({ queryKey: chaves.estatisticas, queryFn: () => api<Estatisticas>('/usuarios/eu/estatisticas'), enabled: ativo });
}

/** Atualiza um post em todos os caches depois de salvar/remover dos salvos. */
export function useAtualizarPost() {
  const qc = useQueryClient();
  return (p: Post) => {
    qc.setQueryData(chaves.post(p.id), p);
    qc.setQueriesData<{ pages: PaginaPosts[] }>({ predicate: (q) => ['mural', 'postsDe', 'salvos'].includes(String(q.queryKey[0])) }, (d) =>
      d?.pages ? { ...d, pages: d.pages.map((pg) => ({ ...pg, itens: pg.itens.map((x) => (x.id === p.id ? p : x)) })) } : d,
    );
    qc.invalidateQueries({ queryKey: chaves.salvos });
    qc.invalidateQueries({ queryKey: chaves.estatisticas });
  };
}

export const mensagemDeErro = (e: unknown) => (e instanceof ErroRequisicao ? e.dados.erro : 'Sem conexão com o servidor. Confira sua internet e tente de novo.');
export const camposDeErro = (e: unknown) => (e instanceof ErroRequisicao ? e.dados.campos ?? {} : {});
