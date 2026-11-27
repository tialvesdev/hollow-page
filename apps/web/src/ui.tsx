import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ACENTOS, type Capa } from '@hp/shared';

/* ---------- ícones de traço (os mesmos do redesign) ---------- */
const P = {
  mural: <><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></>,
  mais: <path d="M12 5v14M5 12h14" />,
  salvo: <path d="M6 3h12v18l-6-4-6 4z" />,
  perfil: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  busca: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  voltar: <path d="M19 12H5M11 6l-6 6 6 6" />,
  seguir: <path d="M5 12h14M13 6l6 6-6 6" />,
  baixar: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  sair: <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M14 8l4 4-4 4M18 12H9" />,
  lixo: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  imagem: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>,
  paleta: <path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.5-.2-.8-.5-1.2-.3-.4-.5-.8-.5-1.3 0-1 .8-1.6 1.8-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4zM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01" />,
  pausa: <path d="M8 5v14M16 5v14" />,
  tocar: <path d="M7 4l13 8-13 8z" />,
  gh: <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
  li: <path d="M4 9h3v11H4zM5.5 4.5h.01M10 9h3v1.6c.6-1 1.8-1.8 3.4-1.8 2.6 0 3.6 1.6 3.6 4.4V20h-3v-6c0-1.4-.4-2.4-1.8-2.4S13 12.6 13 14v6h-3z" />,
  email: <path d="M3 6h18v12H3zM3 7l9 6 9-6" />,
} as const;
export type NomeIcone = keyof typeof P;

export function Icone({ n, s = 24, cheio, traco = 1.8 }: { n: NomeIcone; s?: number; cheio?: boolean; traco?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={cheio ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={traco} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[n]}
    </svg>
  );
}

/**
 * Olho desenhado à mão, no traço dos ícones do jogo: pálpebras arredondadas com espessura
 * irregular e pupila redonda com um brilho. Cerrado, é uma pálpebra curva com três cílios curtos.
 */
export function Olho({ cerrado, s = 22 }: { cerrado?: boolean; s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {cerrado ? (
        <>
          <path d="M2.7 10.4c2.4 3.7 5.6 5.5 9.3 5.5 3.8 0 6.9-1.9 9.3-5.6" strokeWidth={2.1} />
          <path d="M6.4 14.1 5.2 16.4M12.1 15.9l-.1 2.6M17.6 14.2l1.3 2.2" strokeWidth={1.7} />
        </>
      ) : (
        <>
          <path d="M2.4 12.3c2.3-4.2 5.6-6.5 9.6-6.5 4.1 0 7.3 2.3 9.6 6.3" strokeWidth={2.2} />
          <path d="M2.6 12.6c2.4 3.6 5.6 5.6 9.5 5.6 3.8 0 7-1.9 9.3-5.8" strokeWidth={1.5} />
          <path d="M12 8.7a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm1.3 1.3a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" fill="currentColor" fillRule="evenodd" stroke="none" />
        </>
      )}
    </svg>
  );
}

/* ---------- ornamentos (só estes três) ---------- */
export function Rotulo({ children }: { children: ReactNode }) {
  return (
    <div className="rotulo">
      <span>{children}</span>
      <span className="l" aria-hidden="true" />
      <span className="d" aria-hidden="true" />
    </div>
  );
}

export function SetaLosango() {
  return (
    <svg width="30" height="18" viewBox="0 0 34 20" fill="none" stroke="#D9C79A" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 10 10 2l8 8-8 8z" />
      <path d="M10 6.5 13.5 10 10 13.5 6.5 10z" fill="#D9C79A" />
      <path d="M15 10h16M26 5l5 5-5 5" />
    </svg>
  );
}

/*
 * Itens do jogo para os estados vazios, um por situação: a pena do Cornifer (nada publicado), o diário do
 * andarilho (nada salvo), a lanterna de lumaflies (a busca não achou nada), o diário do caçador (sem números)
 * e um fragmento de máscara (erro). Sprites oficiais de Hollow Knight, da Team Cherry.
 */
const ITENS = {
  pena: [110, 91],
  diario: [89, 112],
  lanterna: [122, 131],
  cacador: [192, 220],
  fragmento: [76, 83],
} as const;
export type ItemVazio = keyof typeof ITENS;

/** Estado vazio do site: um item do jogo, um título curto, uma linha de ajuda e a próxima ação. */
export function Vazio({ titulo, texto, acao, item = 'pena' }: { titulo: string; texto?: string; acao?: ReactNode; item?: ItemVazio }) {
  const [w, h] = ITENS[item];
  return (
    <div className="vazio">
      <img className="item-vazio" src={`/img/itens/${item}.webp`} width={w} height={h} alt="" />
      <p>{titulo}</p>
      {texto && <span>{texto}</span>}
      {acao}
    </div>
  );
}

/**
 * Logo do Hollow Page. Nas barras (menu, barra lateral) vai só a tipografia;
 * `ornada` traz os arabescos de cima e de baixo, para áreas de destaque.
 * `empilhada` põe HOLLOW sobre PAGE, para espaços estreitos.
 */
export function Logo({ empilhada, ornada, className }: { empilhada?: boolean; ornada?: boolean; className?: string }) {
  const [src, w, h] = ornada
    ? empilhada ? ['/img/logo-empilhada.webp', 420, 287] as const : ['/img/logo.webp', 720, 298] as const
    : empilhada ? ['/img/logo-texto-empilhada.webp', 368, 164] as const : ['/img/logo-texto.webp', 596, 90] as const;
  return <img className={`logo-hp${empilhada ? ' emp' : ''} ${className ?? ''}`} src={src} alt="Hollow Page" width={w} height={h} />;
}

/** Capa enquadrada pelo ponto focal medido (o texto fica à esquerda; o assunto, no terço da direita). */
export function FotoCapa({ capa, alt }: { capa: Capa; alt?: string }) {
  return (
    <div className="foco" style={{ '--fx': capa.fx, '--fy': capa.fy, '--ar': capa.ar } as CSSProperties}>
      <img src={`/capas/${capa.id}.webp`} alt={alt ?? ''} aria-hidden={alt ? undefined : true} />
    </div>
  );
}

/**
 * Faixa de abertura: foto escurecida, rótulo dourado e título embaixo à esquerda, ações embaixo à direita.
 */
export function Faixa({ capa, alt, alta, rotulo, titulo, sub, quem, acoes }: {
  capa: Capa; alt?: string; alta?: boolean; rotulo?: ReactNode; titulo: ReactNode; sub?: ReactNode; quem?: ReactNode; acoes?: ReactNode;
}) {
  return (
    <section className={`faixa${alta ? ' alta' : ''}`}>
      <FotoCapa capa={capa} alt={alt} />
      <div className="veu" aria-hidden="true" />
      <div className="in">
        <div className="quem">
          {quem}
          <div className="cabeca">
            {rotulo && <Rotulo>{rotulo}</Rotulo>}
            <h1 className="t-pag">{titulo}</h1>
            {sub && <div className="sub">{sub}</div>}
          </div>
        </div>
        {acoes && <div className="acoes">{acoes}</div>}
      </div>
    </section>
  );
}

/** Campo com traço desenhado: rótulo em cima, mensagem de erro ou dica embaixo. */
export function Campo({ id, rotulo, erro, dica, extra, children }: { id: string; rotulo: string; erro?: ReactNode; dica?: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="campo">
      {extra ? <div className="topo-campo"><label htmlFor={id}>{rotulo}</label>{extra}</div> : <label htmlFor={id}>{rotulo}</label>}
      {children}
      {erro ? (
        <span className="msg erro" role="alert" id={`${id}-msg`}>{erro}</span>
      ) : dica ? (
        <span className="msg dica" id={`${id}-msg`} aria-live="polite">{dica}</span>
      ) : null}
    </div>
  );
}

export const iniciais = (nome: string) => nome.trim().split(/\s+/).filter(Boolean).map((p) => p[0]!).filter((_, i, a) => i === 0 || i === a.length - 1).join('').toUpperCase();

export function Avatar({ url, nome, tamanho, className }: { url: string | null | undefined; nome: string; tamanho: number; className?: string }) {
  return (
    <span
      className={`av ${className ?? ''}`}
      aria-hidden="true"
      style={{ width: tamanho, height: tamanho, fontSize: Math.max(13, Math.round(tamanho / 4)), backgroundImage: url ? `url(${url})` : undefined }}
    >
      {!url && iniciais(nome)}
    </span>
  );
}

/* ---------- datas ---------- */
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
/** "9 mai" */
export const diaMes = (iso: string) => { const d = new Date(iso); return `${d.getDate()} ${MESES[d.getMonth()]}`; };
/** "1 mai 2023" */
export const dataCurta = (iso: string) => { const d = new Date(iso); return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`; };
/** "maio de 2023" a partir de "2023-05-09" */
export const mesAno = (dia: string) => { const [a, m] = dia.split('-'); return `${MESES_LONGOS[Number(m) - 1]} de ${a}`; };
/** "9 mai" a partir de "2023-05-09" */
export const diaMesDeDia = (dia: string) => { const [, m, d] = dia.split('-'); return `${Number(d)} ${MESES[Number(m) - 1]}`; };

/* ---------- cor de destaque da landing (apanhadores de sonhos e títulos) ---------- */
const lerAcento = () => {
  try {
    return localStorage.getItem('hp-acento') ?? ACENTOS[0].cor;
  } catch {
    return ACENTOS[0].cor;
  }
};
const AcentoCtx = createContext<{ acento: string; setAcento: (c: string) => void }>({ acento: ACENTOS[0].cor, setAcento: () => undefined });
export const useAcento = () => useContext(AcentoCtx).acento;
export function AcentoProvider({ children }: { children: ReactNode }) {
  const [acento, setAcento] = useState(lerAcento);
  useEffect(() => {
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
      <button className="btn sec ico" aria-label="Cor de destaque da página" aria-expanded={aberta} onClick={() => setAberta(!aberta)}>
        <Icone n="paleta" s={20} />
      </button>
      {aberta && (
        <div className="menu pedra" role="menu" aria-label="Cor de destaque da página">
          <p aria-hidden="true">Cor de destaque</p>
          {ACENTOS.map((a) => (
            <button key={a.cor} role="menuitemradio" aria-checked={acento === a.cor} onClick={() => { setAcento(a.cor); setAberta(false); }}>
              <i style={{ background: a.cor }} />
              {a.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- ícones da navegação, no traço do jogo ---------- */

/*
 * Formas brancas cheias, de pontas afinadas, como os ícones da interface de Hollow Knight:
 * mural = um quadro com o losango pendurado; publicar = a pena do Cornifer (o cartógrafo);
 * salvos = um marcador com losango vazado; perfil = a cabeça do Knight; sair = um portal com a seta saindo.
 */
const NAV = {
  mural: 'M12 1.2 14.3 4 12 5.6 9.7 4ZM3 6.6h18V22H3Zm2 2V20h14V8.6ZM6.3 18.6l3.9-5 2.7 3.2 2.2-2.3 3.4 4.1ZM16.2 10.1a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z',
  publicar: 'M21.4 2.2C14.6 2.5 9 7.2 7 13.6L5.7 17.8 4 22.6l1.5.5 1.6-4.2c4.6-.2 9.1-3.1 11.6-7.9-1.4.3-2.8.3-4-.1 2.3-1.1 4.2-2.9 5.4-5.3-1.3.4-2.5.5-3.6.3 1.6-.9 2.6-2.1 3.3-3.7Z',
  salvo: 'M5.6 1.8h12.8V22.6L12 17.8 5.6 22.6ZM12 5.8 9.6 9 12 12.2 14.4 9Z',
  perfil: '',
  sair: 'M12.5 2.2h4.2a4.6 4.6 0 0 1 4.6 4.6v10.4a4.6 4.6 0 0 1-4.6 4.6h-4.2v-2.3h4.2a2.3 2.3 0 0 0 2.3-2.3V6.8a2.3 2.3 0 0 0-2.3-2.3h-4.2ZM2.6 12l5-4.6v3.3h7.6v2.6H7.6v3.3Z',
} as const;
export type NomeIconeNav = keyof typeof NAV;

export function IconeNav({ n, s = 26 }: { n: NomeIconeNav; s?: number }) {
  if (n === 'perfil')
    // a cabeça do Knight, recortada da arte oficial (chifres e máscara, olhos vazados), pintada com a cor do texto
    return <span className="icone-cabeca" style={{ width: s, height: s }} aria-hidden="true" />;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d={NAV[n]} />
    </svg>
  );
}

/* ---------- carregamento ---------- */

/** Indicador girando, para botões que estão enviando: mostra que algo acontece, mesmo se demorar. */
export function Girando() {
  return <span className="girando" aria-hidden="true" />;
}

/** Bloco de esqueleto piscando, no formato do conteúdo que ainda vai chegar. */
export function Esq({ w, h, r, className, style }: { w?: number | string; h?: number | string; r?: number | string; className?: string; style?: CSSProperties }) {
  return <span className={`esq ${className ?? ''}`} aria-hidden="true" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/** Se a pessoa deixou a barra lateral aberta da última vez (o esqueleto já nasce na mesma largura). */
export function trilhoAbertoSalvo() {
  try {
    return localStorage.getItem('hp-trilho') === 'aberto';
  } catch {
    return false;
  }
}

/** Esqueleto da área logada inteira (barra lateral e conteúdo), enquanto a sessão é conferida. */
export function EsqueletoShell() {
  return (
    <div className="shell" aria-busy="true" aria-label="Carregando">
      <div className={`trilho esq-trilho${trilhoAbertoSalvo() ? ' aberto' : ''}`}>
        <Esq w={76} h={34} />
        {[0, 1, 2, 3].map((i) => <Esq key={i} w={40} h={40} r={8} />)}
      </div>
      <div className="conteudo"><EsqueletoConteudo /></div>
    </div>
  );
}

/** Esqueleto de uma página comum: faixa de abertura, filtros e uma grade de artes. */
export function EsqueletoConteudo() {
  return (
    <>
      <Esq h={48} w="min(620px,70%)" />
      <Esq h={210} />
      <div className="esq-linha">{[90, 110, 80, 96, 120].map((w, i) => <Esq key={i} w={w} h={38} />)}</div>
      <div className="esq-grade">{Array.from({ length: 8 }, (_, i) => <Esq key={i} h={[260, 200, 320, 240][i % 4]} />)}</div>
    </>
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

/** Lê uma imagem escolhida e devolve a URL de prévia, liberando a anterior. */
export function useArquivoImagem() {
  const [img, setImg] = useState<{ arquivo: File; url: string } | null>(null);
  useEffect(() => () => { if (img) URL.revokeObjectURL(img.url); }, [img]);
  return [img, (a: File | null) => setImg(a ? { arquivo: a, url: URL.createObjectURL(a) } : null)] as const;
}

export const tamanhoArquivo = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** Quantas artes por linha nas grades (perfil e salvos); a escolha fica salva neste navegador. */
export function useColunas() {
  const [n, setN] = useState<number>(() => {
    try {
      const v = Number(localStorage.getItem('hp-colunas'));
      return [3, 4, 5].includes(v) ? v : 4;
    } catch {
      return 4;
    }
  });
  const mudar = (v: number) => {
    setN(v);
    try {
      localStorage.setItem('hp-colunas', String(v));
    } catch {
      /* sem armazenamento: só não lembra */
    }
  };
  return [n, mudar] as const;
}

/** Três botões com o desenho da grade (3, 4 ou 5 colunas). No celular some: lá a grade já tem 2. */
export function Colunas({ n, mudar }: { n: number; mudar: (v: number) => void }) {
  return (
    <div className="colunas" role="radiogroup" aria-label="Artes por linha">
      {[3, 4, 5].map((v) => (
        <button key={v} type="button" role="radio" aria-checked={n === v} title={`${v} por linha`} onClick={() => mudar(v)}>
          <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
            {Array.from({ length: v }, (_, i) => {
              const w = (22 - (v - 1) * 2) / v;
              return <rect key={i} x={i * (w + 2)} y="0" width={w} height="16" rx="1" fill="currentColor" />;
            })}
          </svg>
          <span className="sr">{v} por linha</span>
        </button>
      ))}
    </div>
  );
}
