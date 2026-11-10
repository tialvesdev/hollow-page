import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ACENTOS } from '@hp/shared';

/* ---------- ícones de traço, como no original ---------- */
const P = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  plus: 'M12 7v10M7 12h10M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  filter: 'M3 4h18l-7 8.5V19l-4 2v-8.5z',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM16 16l5 5',
  user: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 12.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM6.2 18.4c1.2-2.3 3.3-3.4 5.8-3.4s4.6 1.1 5.8 3.4',
  out: 'M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M14 8l4 4-4 4M18 12H9',
  x: 'M6 6l12 12M18 6 6 18',
  back: 'M15 5l-7 7 7 7',
  save: 'M6 3h12v18l-6-4-6 4z',
  dl: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  pal: 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.5-.2-.8-.5-1.2-.3-.4-.5-.8-.5-1.3 0-1 .8-1.6 1.8-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4zM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  gh: 'M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  li: 'M4 9h3v11H4zM5.5 4.5h.01M10 9h3v1.6c.6-1 1.8-1.8 3.4-1.8 2.6 0 3.6 1.6 3.6 4.4V20h-3v-6c0-1.4-.4-2.4-1.8-2.4S13 12.6 13 14v6h-3z',
} as const;
export type NomeIcone = keyof typeof P;

export function Icone({ n, s = 24, cheio }: { n: NomeIcone; s?: number; cheio?: boolean }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={cheio ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[n]} />
    </svg>
  );
}

/** Campo com o canto ornamentado que continua a linha de baixo. */
export function Campo({ id, rotulo, erro, extra, children }: { id: string; rotulo: string; erro?: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="fld">
      <label htmlFor={id}>{rotulo}</label>
      <div className="ln">
        <span className="orn" aria-hidden="true" />
        {children}
      </div>
      {extra}
      {erro && (
        <span className="err" role="alert" id={`${id}-erro`}>
          {erro}
        </span>
      )}
    </div>
  );
}

export function Moldura({ children, largura }: { children: ReactNode; largura: number }) {
  return (
    <div className="frame" style={{ width: `min(${largura}px, 100%)` }}>
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <span key={c} className={`cn ${c}`} aria-hidden="true" />
      ))}
      {children}
    </div>
  );
}

export function Avatar({ url, tamanho, className }: { url: string | null | undefined; tamanho: number; className?: string }) {
  return (
    <span
      className={`av ${className ?? ''}`}
      style={{
        width: tamanho,
        height: tamanho,
        backgroundImage: `url(${url ?? '/img/knight-crying.webp'})`,
        backgroundSize: url ? 'cover' : '70%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    />
  );
}

/* ---------- cor de destaque ---------- */
const lerAcento = () => {
  try {
    return localStorage.getItem('hp-acento') ?? ACENTOS[0].cor;
  } catch {
    return ACENTOS[0].cor;
  }
};
const AcentoCtx = createContext<{ acento: string; setAcento: (c: string) => void }>({ acento: ACENTOS[0].cor, setAcento: () => undefined });
export function AcentoProvider({ children }: { children: ReactNode }) {
  const [acento, setAcento] = useState(lerAcento);
  useEffect(() => {
    document.documentElement.style.setProperty('--acento', acento);
    try {
      localStorage.setItem('hp-acento', acento);
    } catch {
      /* navegação privada: só não lembra a escolha */
    }
  }, [acento]);
  return <AcentoCtx.Provider value={{ acento, setAcento }}>{children}</AcentoCtx.Provider>;
}

export function Paleta() {
  const { acento, setAcento } = useContext(AcentoCtx);
  const [aberta, setAberta] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberta) return;
    const fora = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setAberta(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberta(false);
    document.addEventListener('pointerdown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [aberta]);
  return (
    <div className="pal" ref={ref}>
      <button aria-label="Cor de destaque" aria-expanded={aberta} onClick={() => setAberta(!aberta)}>
        <Icone n="pal" />
      </button>
      {aberta && (
        <div className="sw" role="menu">
          {ACENTOS.map((a) => (
            <button key={a.cor} role="menuitemradio" aria-checked={acento === a.cor} aria-pressed={acento === a.cor} onClick={() => { setAcento(a.cor); setAberta(false); }}>
              <i style={{ background: a.cor }} />
              {a.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- avisos ---------- */
const AvisoCtx = createContext<(t: string) => void>(() => undefined);
export const useAviso = () => useContext(AvisoCtx);
export function AvisoProvider({ children }: { children: ReactNode }) {
  const [texto, setTexto] = useState<string | null>(null);
  const timer = useRef<number>();
  const agendar = (ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTexto(null), ms);
  };
  const avisar = useCallback((t: string) => {
    setTexto(t);
    agendar(5500);
  }, []);
  return (
    <AvisoCtx.Provider value={avisar}>
      {children}
      {texto && (
        <div className="toast" role="status" onMouseEnter={() => window.clearTimeout(timer.current)} onMouseLeave={() => agendar(2500)}>
          {texto}
        </div>
      )}
    </AvisoCtx.Provider>
  );
}

/* ---------- navegação com transição entre landing, entrar e cadastro ---------- */
const PUBLICAS = ['/', '/entrar', '/cadastro'];
export function useIr() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return useCallback(
    (para: string, opcoes?: { replace?: boolean }) => {
      const destino = para.split('?')[0]!;
      const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const tipo = PUBLICAS.includes(pathname) && PUBLICAS.includes(destino) && pathname !== destino ? (pathname === '/' ? 'ida' : destino === '/' ? 'volta' : 'troca') : null;
      if (tipo && !reduz && 'startViewTransition' in document) {
        document.documentElement.dataset.vt = tipo;
        window.setTimeout(() => delete document.documentElement.dataset.vt, 900);
        navigate(para, { ...opcoes, viewTransition: true });
      } else navigate(para, opcoes);
      window.scrollTo(0, 0);
    },
    [navigate, pathname],
  );
}

/** Mantém o foco do teclado dentro de um diálogo e devolve ao fechar. */
export function usePrenderFoco(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null;
    const sel = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const k = (e: KeyboardEvent) => {
      const el = ref.current;
      if (e.key !== 'Tab' || !el) return;
      const f = [...el.querySelectorAll<HTMLElement>(sel)].filter((x) => x.offsetParent !== null || x === document.activeElement);
      if (!f.length) return;
      const a = f[0]!, z = f[f.length - 1]!;
      if (!el.contains(document.activeElement)) { e.preventDefault(); a.focus(); }
      else if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('keydown', k);
      antes?.focus?.();
    };
  }, [ref]);
}

export const dataHora = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(',', '');
