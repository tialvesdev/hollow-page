import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { CAPAS, TAGS, type PaginaPosts, type Post } from '@hp/shared';
import { api, chaves, mensagemDeErro } from '../api';
import { Faixa, Girando, Icone, Vazio, diaMes } from '../ui';
import { LogoTopo } from './Shell';

/** Abre o post na sobreposição, mantendo a página de fundo. */
export function useAbrirPost() {
  const [params, setParams] = useSearchParams();
  return (id: string) => {
    const n = new URLSearchParams(params);
    n.set('post', id);
    setParams(n);
  };
}

/** Arte no mural: imagem com raio 24, título e autor abaixo (nunca por cima). */
export function Arte({ p, grade }: { p: Post; grade?: boolean }) {
  const abrir = useAbrirPost();
  return (
    <button className="arte" onClick={() => abrir(p.id)} aria-label={`${p.titulo}, por ${p.autor.nome}${p.salvoPorMim ? ' (salva por você)' : ''}`}>
      <span className="img">
        <img src={p.imagemUrl} alt="" loading="lazy" width={p.largura} height={p.altura} style={{ ['--ar' as string]: `${p.largura}/${p.altura}` }} />
      </span>
      <span className="leg" aria-hidden="true">
        <b>{p.titulo}</b>
        <span className="leg-info">
          {p.salvoPorMim && <span className="selo" title="Salva por você"><Icone n="salvo" s={13} cheio traco={2} /></span>}
          {grade ? diaMes(p.criadoEm) : p.autor.nome}
        </span>
      </span>
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
export function Mural({ chave, caminho, vazio, grade, colunas }: { chave: readonly unknown[]; caminho: (cursor?: string) => string; vazio: ReactNode; grade?: boolean; colunas?: number }) {
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

  const classe = grade ? 'grade' : 'mural';
  const estilo = grade && colunas ? ({ '--cols': colunas } as CSSProperties) : undefined;
  if (q.isPending) return <div className={classe} style={estilo} aria-busy="true">{Array.from({ length: grade ? 6 : 8 }, (_, i) => <div key={i} className="skel" style={grade ? undefined : { height: 180 + ((i * 53) % 140) }} />)}</div>;
  if (q.isError) return <p className="erro-box" role="alert">{mensagemDeErro(q.error)} <button className="lnk" onClick={() => q.refetch()}>Tentar de novo</button></p>;
  const itens = q.data.pages.flatMap((p) => p.itens);
  if (!itens.length) return <>{vazio}</>;
  return (
    <>
      <div className={classe} style={estilo}>{itens.map((p) => <Arte key={p.id} p={p} grade={grade} />)}</div>
      <div ref={fim} />
      {q.hasNextPage && (
        <div className="mais-pg"><button className="btn sec" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage} aria-busy={q.isFetchingNextPage}>{q.isFetchingNextPage ? <><Girando />Carregando…</> : 'Ver mais'}</button></div>
      )}
    </>
  );
}

export default function Feed() {
  const [params, setParams] = useSearchParams();
  const tags = (params.get('tags') ?? '').split(',').filter(Boolean);
  const [texto, setTexto] = useState(params.get('q') ?? '');
  const q = useAtrasado(texto.trim());

  useEffect(() => {
    const p = new URLSearchParams(params);
    if (q) p.set('q', q); else p.delete('q');
    if (p.toString() !== params.toString()) setParams(p, { replace: true });
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const mudarTags = (novas: string[]) => {
    const p = new URLSearchParams(params);
    if (novas.length) p.set('tags', novas.join(',')); else p.delete('tags');
    setParams(p, { replace: true });
  };
  const qs = new URLSearchParams();
  if (q) qs.set('q', q);
  if (tags.length) qs.set('tags', tags.join(','));

  const rotulo = q ? `Busca: “${q}”` : tags.length ? `${tags.length} ${tags.length === 1 ? 'atributo' : 'atributos'} no filtro` : undefined;

  return (
    <>
      {/* no celular a logo fica no alto da página; a busca e o botão vêm logo abaixo da faixa */}
      <div className="logo-cel"><LogoTopo /></div>
      <Faixa capa={CAPAS[1]} rotulo={rotulo} titulo="Mural" />
      <div className="topo">
        <div className="busca" role="search">
          <Icone n="busca" s={20} traco={2} />
          <input type="search" aria-label="Buscar" placeholder="Buscar artes, artistas ou descrições" value={texto} onChange={(e) => setTexto(e.target.value)} />
          {texto && <button className="limpar" aria-label="Limpar busca" onClick={() => setTexto('')}><Icone n="x" s={18} traco={2} /></button>}
        </div>
        <Link className="btn" to="/publicar"><Icone n="mais" s={18} traco={2.4} />Publicar arte</Link>
      </div>
      <div className="filtros" role="group" aria-label="Filtrar por atributo">
        <button className="chip" aria-pressed={!tags.length} onClick={() => mudarTags([])}>Tudo</button>
        {TAGS.map((t) => (
          <button key={t} className="chip" aria-pressed={tags.includes(t)} onClick={() => mudarTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</button>
        ))}
      </div>
      <Mural
        chave={chaves.mural(q, tags)}
        caminho={(c) => { const p = new URLSearchParams(qs); if (c) p.set('cursor', c); return `/posts?${p}`; }}
        vazio={
          q || tags.length ? (
            <Vazio item="lanterna" titulo="Nenhuma arte encontrada" texto="Tente outra palavra ou tire alguns filtros."
              acao={<button className="btn sec" onClick={() => { setTexto(''); mudarTags([]); }}>Limpar busca e filtros</button>} />
          ) : (
            <Vazio titulo="O mural ainda está vazio" texto="A primeira arte pode ser a sua." acao={<Link className="btn" to="/publicar">Publicar arte</Link>} />
          )
        }
      />
    </>
  );
}
