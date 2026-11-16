import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { TAGS, type PaginaPosts, type Post } from '@hp/shared';
import { api, chaves, mensagemDeErro } from '../api';
import { Icone } from '../ui';

export function Pin({ p }: { p: Post }) {
  const [params, setParams] = useSearchParams();
  const abrir = () => {
    const n = new URLSearchParams(params);
    n.set('post', p.id);
    setParams(n);
  };
  return (
    <button className="pin" onClick={abrir} aria-label={`${p.titulo}, por ${p.autor.nome}`}>
      <img src={p.imagemUrl} alt="" loading="lazy" width={p.largura} height={p.altura} style={{ ['--ar' as string]: `${p.largura}/${p.altura}` }} />
      {p.salvoPorMim && <span className="sv" aria-hidden="true"><Icone n="save" s={15} cheio /></span>}
      <span className="cap">{p.titulo}</span>
    </button>
  );
}

function useAtrasado<T>(valor: T, ms = 300) {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return v;
}

/** Lista paginada que carrega a próxima página quando o fim aparece na tela. */
export function Mural({ chave, caminho, vazio, grade }: { chave: readonly unknown[]; caminho: (cursor?: string) => string; vazio: React.ReactNode; grade?: boolean }) {
  const fim = useRef<HTMLDivElement>(null);
  const q = useInfiniteQuery({
    queryKey: chave,
    queryFn: ({ pageParam }) => api<PaginaPosts>(caminho(pageParam)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (u) => u.proximo ?? undefined,
  });
  useEffect(() => {
    const el = fim.current;
    if (!el || !q.hasNextPage) return;
    const io = new IntersectionObserver((e) => e[0]?.isIntersecting && !q.isFetchingNextPage && q.fetchNextPage(), { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage]);

  if (q.isPending) return <div className="mural" aria-busy="true">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skel" style={{ height: 160 + ((i * 53) % 140) }} />)}</div>;
  if (q.isError) return <p className="erro-box" role="alert">{mensagemDeErro(q.error)} <button className="lnk" onClick={() => q.refetch()}>Tentar de novo</button></p>;
  const itens = q.data.pages.flatMap((p) => p.itens);
  if (!itens.length) return <>{vazio}</>;
  return (
    <>
      <div className={grade ? 'pgrid' : 'mural'}>{itens.map((p) => <Pin key={p.id} p={p} />)}</div>
      <div ref={fim} />
      {q.hasNextPage && (
        <div className="more"><button className="lnk" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>{q.isFetchingNextPage ? 'Carregando…' : 'Ver mais'}</button></div>
      )}
    </>
  );
}

export default function Feed() {
  const [params, setParams] = useSearchParams();
  const tags = (params.get('tags') ?? '').split(',').filter(Boolean);
  const q = useAtrasado(params.get('q') ?? '');
  const painel = params.get('painel');
  const mudarTags = (novas: string[]) => {
    const p = new URLSearchParams(params);
    if (novas.length) p.set('tags', novas.join(',')); else p.delete('tags');
    setParams(p, { replace: true });
  };
  const qs = new URLSearchParams();
  if (q) qs.set('q', q);
  if (tags.length) qs.set('tags', tags.join(','));

  return (
    <div className="page">
      {(painel === 'filtro' || tags.length > 0) && (
        <div className="fbox">
          <div className="h">
            <span>Filtrar por atributos</span>
            {tags.length > 0 && <button className="lnk muted" onClick={() => mudarTags([])}>Limpar filtros</button>}
          </div>
          <div className="chips">
            {TAGS.map((t) => (
              <button key={t} className="chip" aria-pressed={tags.includes(t)} onClick={() => mudarTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</button>
            ))}
          </div>
        </div>
      )}
      <Mural
        chave={chaves.mural(q, tags)}
        caminho={(c) => { const p = new URLSearchParams(qs); if (c) p.set('cursor', c); return `/posts?${p}`; }}
        vazio={
          <div className="empty">
            <img src="/img/knight-crying.webp" alt="" />
            <p>{q || tags.length ? 'Nenhuma publicação encontrada' : 'O mural ainda está vazio'}</p>
            <span>{q || tags.length ? 'Tente outra palavra ou tire alguns filtros.' : 'Que tal fazer a primeira publicação?'}</span>
          </div>
        }
      />
    </div>
  );
}
