import { useLayoutEffect, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, useEu } from '../api';
import { EsqueletoShell, IconeNav, Logo, trilhoAbertoSalvo, useAviso, type NomeIconeNav } from '../ui';

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

function Item({ para, icone, rotulo, ativo }: { para: string; icone: NomeIconeNav; rotulo: string; ativo: boolean }) {
  return (
    <Link className="ti" to={para} aria-current={ativo ? 'page' : undefined} title={rotulo}>
      <IconeNav n={icone} />
      <span className="ti-rot">{rotulo}</span>
    </Link>
  );
}

/** Barra lateral recolhida (só ícones) ou aberta (ícone e nome lado a lado); a escolha fica salva. */
function useTrilhoAberto() {
  const [aberto, setAberto] = useState(trilhoAbertoSalvo);
  const alternar = () => {
    setAberto((a) => {
      try {
        localStorage.setItem('hp-trilho', a ? 'recolhido' : 'aberto');
      } catch {
        /* sem armazenamento: só não lembra */
      }
      return !a;
    });
  };
  return [aberto, alternar] as const;
}

/**
 * Seletor da barra lateral: um só elemento (faixa clara e as setas da loja do jogo) que desliza
 * até o item ativo, subindo ou descendo, em vez de aparecer de repente no item novo.
 */
function useSeletor(chave: string) {
  const lista = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ y: number; h: number } | null>(null);
  // ao carregar a página o seletor já aparece no lugar; só desliza nas trocas dentro do site
  const [anima, setAnima] = useState(false);
  useLayoutEffect(() => {
    const medir = () => {
      const a = lista.current?.querySelector<HTMLElement>('.ti[aria-current=page]');
      setPos(a ? { y: a.offsetTop, h: a.offsetHeight } : null);
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [chave]);
  useLayoutEffect(() => {
    if (!pos || anima) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setAnima(true)));
    return () => cancelAnimationFrame(r);
  }, [pos, anima]);
  return { lista, pos, anima };
}

export default function Shell() {
  const { data: eu, isLoading } = useEu();
  const { pathname, search } = useLocation();
  const sair = useSair();
  const [aberto, alternarTrilho] = useTrilhoAberto();
  const seletor = useSeletor(`${pathname}${search}${eu ? '|eu' : ''}`);

  if (isLoading) return <EsqueletoShell />;
  if (!eu) return <Navigate to={`/entrar?volta=${encodeURIComponent(pathname + search)}`} replace />;

  const perfil = pathname === '/perfil' || pathname === `/perfil/${eu.id}` || pathname === '/editar-perfil';

  return (
    <div className="shell">
      <nav className={`trilho${aberto ? ' aberto' : ''}`} aria-label="Principal">
        <Link to="/feed" className="marca-hp" aria-label="Hollow Page, ir para o mural">
          <Logo empilhada className="l-fechada" />
          <Logo className="l-aberta" />
        </Link>
        <div className="itens" ref={seletor.lista}>
          <span className={`seletor${seletor.pos ? '' : ' oculto'}${seletor.anima ? ' anima' : ''}`} aria-hidden="true"
            style={seletor.pos ? { transform: `translateY(${seletor.pos.y}px)`, height: seletor.pos.h } : undefined}>
            <i className="seta-lado" />
          </span>
          <Item para="/feed" icone="mural" rotulo="Mural" ativo={pathname === '/feed'} />
          <Item para="/publicar" icone="publicar" rotulo="Publicar" ativo={pathname === '/publicar'} />
          <Item para="/salvos" icone="salvo" rotulo="Salvos" ativo={pathname === '/salvos'} />
          <Item para="/perfil" icone="perfil" rotulo="Perfil" ativo={perfil} />
        </div>
        <div className="fim">
          <button className="ti" onClick={sair} title="Sair"><IconeNav n="sair" /><span className="ti-rot">Sair</span></button>
        </div>
        {/* alça na borda da barra: abre (mostra os nomes) ou recolhe (só ícones) */}
        <button type="button" className="alca" onClick={alternarTrilho} aria-expanded={aberto} aria-label={aberto ? 'Recolher o menu' : 'Abrir o menu com os nomes'} title={aberto ? 'Recolher o menu' : 'Abrir o menu'} />
      </nav>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}

/** Logo que só aparece no topo das páginas no celular (no desktop está na barra lateral). */
export function LogoTopo() {
  return <Link to="/feed" className="marca-hp" aria-label="Hollow Page, ir para o mural"><Logo /></Link>;
}
