import { useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, useEu } from '../api';
import { Icone, Paleta, useAviso, type NomeIcone } from '../ui';

const FRASES = ['Descenda até as profundezas', 'Aventure-se', 'Explore os mistérios', 'Não tenha medo'];

export function useSair() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const avisar = useAviso();
  return async () => {
    await api('/auth/sair', { method: 'POST' }).catch(() => undefined);
    qc.clear();
    qc.setQueryData(['eu'], null);
    navigate('/');
    avisar('Você saiu da sua conta');
  };
}

export default function Shell() {
  const { data: eu, isLoading } = useEu();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const sair = useSair();
  const [aberto, setAberto] = useState(false);
  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);

  if (isLoading) return <div className="carregando">Carregando…</div>;
  if (!eu) return <Navigate to={`/entrar?volta=${encodeURIComponent(pathname + search)}`} replace />;

  const noFeed = pathname === '/feed';
  const painel = params.get('painel');
  const q = params.get('q') ?? '';
  const tags = params.get('tags');
  const muda = (mudar: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(mudar)) (v === null || v === '' ? p.delete(k) : p.set(k, v));
    if (!noFeed) navigate(`/feed?${p}`); else setParams(p, { replace: true });
  };
  const meuPerfil = pathname === '/perfil' || pathname === `/perfil/${eu.id}`;
  const titulo = noFeed ? `${frase}, ${eu.nome.split(' ')[0]}` : pathname.startsWith('/perfil') ? 'Perfil' : pathname === '/publicar' ? 'Nova publicação' : 'Editar perfil';

  const Item = ({ icone, rotulo, ativo, pagina, onClick, classe, avatar }: { icone: NomeIcone; rotulo: string; ativo?: boolean; pagina?: boolean; onClick: () => void; classe?: string; avatar?: string | null }) => (
    <button className={`si ${classe ?? ''}`} aria-current={pagina ? 'page' : undefined} aria-pressed={!pagina && ativo ? true : undefined} onClick={onClick} title={rotulo}>
      {avatar ? <span className="avs" style={{ backgroundImage: `url(${avatar})` }} /> : <Icone n={icone} />}
      <span className="lb">{rotulo}</span>
    </button>
  );

  return (
    <div className="shell">
      <nav className={`side-nav${aberto ? ' open' : ''}`} aria-label="Menu" onMouseEnter={() => window.matchMedia('(hover:hover)').matches && setAberto(true)} onMouseLeave={() => setAberto(false)}>
        <div className="grp">
          <Item icone="home" rotulo="Início" pagina={noFeed && !painel && !q && !tags} onClick={() => navigate('/feed')} />
          <Item icone="plus" rotulo="Publicar" pagina={pathname === '/publicar'} onClick={() => navigate('/publicar')} />
          <Item icone="filter" classe="desk" rotulo="Filtrar" ativo={painel === 'filtro' || !!tags} onClick={() => muda({ painel: painel === 'filtro' ? null : 'filtro' })} />
          <Item icone="search" rotulo="Pesquisar" ativo={painel === 'busca' || !!q} onClick={() => muda({ painel: painel === 'busca' ? null : 'busca' })} />
        </div>
        <div className="grp">
          <Item icone="user" rotulo={eu.nome.split(' ')[0]!} avatar={eu.fotoUrl} pagina={meuPerfil} onClick={() => navigate('/perfil')} />
          <Item icone="out" rotulo="Sair" classe="exit desk" onClick={sair} />
        </div>
      </nav>
      <div className="main">
        <header className="top">
          {noFeed && painel === 'busca' ? (
            <div className="srch">
              <Icone n="search" s={20} />
              <label htmlFor="q" className="sr">Pesquisar</label>
              <input id="q" className="inp" autoFocus placeholder="Pesquise por título, descrição ou autor" defaultValue={q} onChange={(e) => muda({ q: e.target.value })} />
              <button className="xbtn" aria-label="Fechar pesquisa" onClick={() => muda({ q: null, painel: null })}><Icone n="x" s={20} /></button>
            </div>
          ) : (
            <h1>{titulo}</h1>
          )}
          {noFeed && painel !== 'busca' && (
            <button className={`ftog${painel === 'filtro' || tags ? ' on' : ''}`} aria-pressed={painel === 'filtro' || !!tags} onClick={() => muda({ painel: painel === 'filtro' ? null : 'filtro' })}>
              <Icone n="filter" s={20} />Filtrar
            </button>
          )}
          <Paleta />
        </header>
        <Outlet />
      </div>
    </div>
  );
}
