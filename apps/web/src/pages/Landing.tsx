import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { PaginaPosts, Post } from '@hp/shared';
import { api, useEu } from '../api';
import { Icone, Paleta, useAcento, useIr } from '../ui';

/* duas fotos como cartas na mão: clicar troca a da frente com a de trás */
function Cartas({ imgs, rotulo }: { imgs: [string, string]; rotulo: string }) {
  const [frente, setFrente] = useState(1);
  const [anim, setAnim] = useState(false);
  return (
    <button className={`pics${anim ? ' anim' : ''}`} onClick={() => { setFrente((f) => 1 - f); setAnim(true); }} aria-label={`Trocar a imagem da frente: ${rotulo}`}>
      {imgs.map((n, i) => (
        <img key={n} className={i === frente ? 'fr' : 'bk'} src={`/img/${n}.webp`} alt="" loading="lazy" onAnimationEnd={() => setAnim(false)} />
      ))}
    </button>
  );
}

/* apanhadores de sonhos subindo e girando ao fundo, na cor escolhida na paleta */
function Sonhos() {
  const ref = useRef<HTMLCanvasElement>(null);
  const cor = useAcento();
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const img = new Image();
    img.src = '/img/dream-particle.webp';
    type Part = { s: HTMLCanvasElement; x: number; y: number; vy: number; vx: number; rot: number; vr: number; size: number; grow: number; age: number; life: number; amax: number };
    let sprites: HTMLCanvasElement[] = [], parts: Part[] = [], raf = 0, last = 0, W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const tingir = (blur: number) => {
      const S = 160, pad = blur ? 24 : 2;
      const t = document.createElement('canvas'); t.width = t.height = S;
      const tg = t.getContext('2d')!; tg.drawImage(img, 0, 0, S, S); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = cor; tg.fillRect(0, 0, S, S);
      const o = document.createElement('canvas'); o.width = o.height = S + pad * 2;
      const g = o.getContext('2d')!; if (blur) g.filter = `blur(${blur}px)`; g.drawImage(t, pad, pad);
      return o;
    };
    const nova = (inicio: boolean): Part => {
      const life = 9 + Math.random() * 10;
      return { s: sprites[Math.floor(Math.random() * sprites.length)]!, x: Math.random() * W, y: inicio ? Math.random() * H : H + 60, vy: 14 + Math.random() * 30, vx: (Math.random() - 0.5) * 10,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.9, size: 26 + Math.random() * 60, grow: 1 + Math.random() * 0.9, age: inicio ? Math.random() * life : 0, life, amax: 0.18 + Math.random() * 0.4 };
    };
    const quantos = () => Math.round(Math.min(34, Math.max(10, (W * H) / 52000)));
    const desenhar = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p, i) => {
        p.age += dt; p.y -= p.vy * dt; p.x += p.vx * dt; p.rot += p.vr * dt;
        const k = p.age / p.life;
        if (k >= 1 || p.y < -120) { parts[i] = nova(false); return; }
        const tam = p.size * (1 + (p.grow - 1) * k) * (p.s.width / 160);
        ctx.save(); ctx.globalAlpha = p.amax * Math.min(1, k * 4, (1 - k) * 3); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.drawImage(p.s, -tam / 2, -tam / 2, tam, tam); ctx.restore();
      });
      if (!reduz) raf = requestAnimationFrame(desenhar);
    };
    img.onload = () => {
      sprites = [tingir(0), tingir(4), tingir(9)];
      resize(); parts = Array.from({ length: quantos() }, () => nova(true)); last = performance.now(); desenhar(last);
    };
    const aoRedimensionar = () => { resize(); const n = quantos(); while (parts.length < n) parts.push(nova(true)); parts.length = n; };
    window.addEventListener('resize', aoRedimensionar);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', aoRedimensionar); };
  }, [cor]);
  return <canvas className="sonhos" ref={ref} aria-hidden="true" />;
}

/* vídeo do YouTube tocando ao fundo do topo como um gif: mudo, em loop e sem controles.
   O player só aparece depois de já estar tocando, para os botões que o YouTube mostra
   ao carregar não ficarem visíveis; enquanto isso (ou com movimento reduzido), fica a foto.
   O loop é feito por aqui (volta ao início um pouco antes do fim), sem o parâmetro de playlist,
   que faz o YouTube desenhar os botões de pular e voltar. */
const VIDEO_TOPO = 'NhG6PA9Xoog';
const YT_ORIGEM = 'https://www.youtube-nocookie.com';
function VideoTopo() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [visivel, setVisivel] = useState(false);
  const reduz = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduz) return;
    let mostrar = 0, tocando = false, duracao = 0, voltando = false, ouviu = false, tentativas = 0;
    /* pede ao player para avisar o estado (tocando, parado, fim); repete até ele responder */
    const ouvir = window.setInterval(() => {
      if (ouviu || ++tentativas > 60) return window.clearInterval(ouvir);
      ref.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'topo', channel: 'widget' }), YT_ORIGEM);
    }, 250);
    const comando = (func: string, args: unknown[] = []) =>
      ref.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), YT_ORIGEM);
    /* estados do YouTube: 1 tocando, 2 pausado, 0 terminou, 3 carregando, -1 sem começar */
    const aoMudar = (estado: number) => {
      if (estado === 0) { comando('seekTo', [0, true]); comando('playVideo'); return; }
      if (estado === 1 && !tocando) {
        tocando = true;
        window.clearTimeout(mostrar);
        mostrar = window.setTimeout(() => setVisivel(true), 1800);
      } else if ((estado === 2 || estado === -1) && tocando) {
        /* parado, o YouTube mostra os botões por cima: volta para a foto até tocar de novo */
        tocando = false;
        window.clearTimeout(mostrar);
        setVisivel(false);
      }
    };
    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGEM || e.source !== ref.current?.contentWindow || typeof e.data !== 'string') return;
      let msg: { event?: string; info?: { playerState?: number; currentTime?: number; duration?: number } | number };
      try { msg = JSON.parse(e.data); } catch { return; }
      ouviu = true;
      if (msg.event === 'onStateChange' && typeof msg.info === 'number') aoMudar(msg.info);
      if (msg.event === 'infoDelivery' && msg.info && typeof msg.info === 'object') {
        const i = msg.info;
        if (typeof i.duration === 'number' && i.duration > 0) duracao = i.duration;
        if (typeof i.playerState === 'number') aoMudar(i.playerState);
        if (typeof i.currentTime === 'number' && duracao > 0) {
          /* a duração informada vem arredondada para cima, então volta um pouco antes */
          if (i.currentTime > duracao - 1.2 && !voltando) { voltando = true; comando('seekTo', [0, true]); }
          else if (i.currentTime < duracao - 3) voltando = false;
        }
      }
    };
    window.addEventListener('message', aoReceber);
    return () => { window.removeEventListener('message', aoReceber); window.clearTimeout(mostrar); window.clearInterval(ouvir); };
  }, [reduz]);

  if (reduz) return null;
  const params = new URLSearchParams({
    autoplay: '1', mute: '1', controls: '0', disablekb: '1', fs: '0', modestbranding: '1', rel: '0', playsinline: '1', iv_load_policy: '3',
    enablejsapi: '1', origin: window.location.origin,
  });
  return (
    <div className={`yt-fundo${visivel ? ' on' : ''}`} aria-hidden="true">
      <iframe
        ref={ref}
        src={`${YT_ORIGEM}/embed/${VIDEO_TOPO}?${params}`}
        title="Vídeo de fundo"
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

function Pausa() {
  const [p, setP] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('pausado', p);
    return () => document.documentElement.classList.remove('pausado');
  }, [p]);
  return (
    <button className="pausa" aria-pressed={p} onClick={() => setP(!p)}>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path d={p ? 'M7 4l13 8-13 8z' : 'M6 4h4v16H6zM14 4h4v16h-4z'} fill="currentColor" />
      </svg>
      {p ? 'Retomar carrossel' : 'Pausar carrossel'}
    </button>
  );
}

/* uma fileira do carrossel: as artes passam como cartas sobre a mesa (só para ver, não abrem o post) */
/*
 * Lumaflies do chamado final: pontos de luz que flutuam devagar, cada um num caminho e ritmo próprios.
 * x/y = posição inicial (% da seção), d = duração do voo, a = atraso negativo (já começam no meio do caminho),
 * s = tamanho, b = duração da piscada.
 */
const LUMAFLIES = [
  [8, 62, 17, -3, 4, 3.1], [14, 30, 22, -11, 3, 2.4], [21, 74, 19, -7, 5, 3.6], [27, 44, 25, -15, 3, 2.8],
  [33, 18, 21, -2, 4, 3.3], [39, 66, 18, -9, 3, 2.2], [46, 36, 24, -13, 5, 3.9], [53, 80, 20, -5, 3, 2.6],
  [58, 24, 23, -17, 4, 3.0], [64, 58, 19, -8, 3, 2.5], [70, 40, 26, -4, 5, 3.5], [76, 72, 21, -12, 3, 2.9],
  [82, 28, 18, -6, 4, 3.2], [88, 54, 24, -14, 3, 2.3], [93, 78, 20, -10, 4, 3.7], [97, 38, 22, -1, 3, 2.7],
].map(([x, y, d, a, sz, b]) => ({ '--x': `${x}%`, '--y': `${y}%`, '--d': `${d}s`, '--a': `${a}s`, '--s': `${sz}px`, '--b': `${b}s` }));

/** Abaixo disso, as artes ficam paradas em vez de girar no carrossel. */
const MIN_CARROSSEL = 6;

function CartaArte({ p, copia }: { p: Post; copia?: boolean }) {
  return (
    <figure className="carta-arte" aria-hidden={copia ? true : undefined}>
      <img src={p.imagemUrl} alt={copia ? '' : `${p.titulo}, por ${p.autor.nome}`} loading="lazy" />
      <figcaption>
        <b>{p.titulo}</b>
        <span>{p.autor.nome}</span>
        <span className="salvos"><Icone n="salvo" s={14} cheio />{p.salvos === 1 ? 'Salva 1 vez' : `Salva ${p.salvos} vezes`}</span>
      </figcaption>
    </figure>
  );
}

function Esteira({ itens, reverso }: { itens: Post[]; reverso?: boolean }) {
  return (
    <div className={`esteira${reverso ? ' reverso' : ''}`}>
      <div className="trilha">
        {[0, 1].map((k) => itens.map((p, i) => <CartaArte key={`${k}-${i}-${p.id}`} p={p} copia={!!k} />))}
      </div>
    </div>
  );
}

/* repete a lista até ter cartas suficientes para a fileira não ficar com buraco */
function encher<T>(xs: T[], min: number): T[] {
  if (!xs.length) return xs;
  const r = [...xs];
  while (r.length < min) r.push(...xs);
  return r;
}

const SECOES: { imgs: [string, string]; alt: string; titulo: ReactNode; texto: ReactNode }[] = [
  { imgs: ['dirtmouth-well', 'dirtmouth-bench'], alt: 'Dirtmouth', titulo: <>Explore o reino esquecido de <span className="realce">Hallownest</span></>,
    texto: <><p>Embaixo da cidade desbotada de Dirtmouth descansa um vasto reino antigo. Muitos são atraídos sob a superfície, à procura de riqueza, glória ou respostas para velhos segredos.</p><p style={{ marginTop: 10 }}>Como o enigmático Cavaleiro, você vai cruzar as profundezas, desvendar seus mistérios e conquistar seus males.</p></> },
  { imgs: ['colosseum-of-fools', 'the-hive'], alt: 'Coliseu dos Tolos e Colmeia', titulo: <>Sobreviva com o <span className="realce">reflexo mais afiado</span> que tiver</>,
    texto: <p>Jogabilidade é importante e é entregue em Hollow Knight, de mapas com ótimo <i>level design</i> e curva de aprendizado até o Coliseu dos Tolos para testar suas habilidades.</p> },
  { imgs: ['gods-and-nightmares', 'grimm-nightmare'], alt: 'Gods & Nightmares e Pesadelo do Grimm', titulo: <>Uma trilha <span className="realce">assombrada</span> e <span className="realce">orquestral</span></>,
    texto: <><p>Com uma ambientação assustadora, o jogo expressa cada sentimento da história e do lugar com seu visual e, principalmente, com suas músicas, por exemplo:</p><ul><li><span className="realce">Vazio:</span> uma cidadezinha deserta com ventos uivantes;</li><li><span className="realce">Melancolia:</span> a metrópole devastada com sons de chuva;</li><li><span className="realce">Intensidade:</span> uma batalha em outro plano com o mestre de um culto.</li></ul></> },
  { imgs: ['crystal-bench', 'crystal-peak'], alt: 'Pico de Cristal', titulo: <>O jogo de insetos <span className="realce">mais lindo</span> de todos</>,
    texto: <p>Justamente o inverso do que se imagina de um jogo de insetos: Hollow Knight tem áreas repletas de detalhes e uma ambientação impressionante, com luzes e efeitos gráficos que acentuam toda a sua essência.</p> },
];

export default function Landing() {
  const ir = useIr();
  const { data: eu } = useEu();
  const [solida, setSolida] = useState(false);
  const { data } = useQuery({ queryKey: ['vitrine'], queryFn: () => api<PaginaPosts>('/posts?limite=60') });
  useEffect(() => {
    const f = () => setSolida(window.scrollY > 10);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const pular = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  /* as mais salvas passam no carrossel, só para ver (não abrem o post) */
  const famosas = [...(data?.itens ?? [])].sort((a, b) => b.salvos - a.salvos).slice(0, 16);
  const linhaA = encher(famosas.filter((_, i) => i % 2 === 0), 8);
  const linhaB = encher(famosas.filter((_, i) => i % 2 === 1).concat(famosas.length < 8 ? famosas.filter((_, i) => i % 2 === 0) : []), 8);
  const cor = useAcento();

  return (
    <div className="landing" style={{ "--realce": cor } as React.CSSProperties}>
      <Sonhos />
      <nav className={`nav${solida ? ' solid' : ''}`} aria-label="Principal">
        <a className="logo" href="#topo" onClick={pular('topo')}><img src="/img/logo-texto.webp" alt="Hollow Page" width="596" height="90" /></a>
        <ul>
          <li><a href="#topo" onClick={pular('topo')}>Início</a></li>
          <li><a href="#hollow-knight" onClick={pular('hollow-knight')}>Hollow Knight</a></li>
          <li><a href="#projeto" onClick={pular('projeto')}>Projeto</a></li>
        </ul>
        <div className="r">
          <Paleta />
          {eu
            ? <Link className="lbtn sm" to="/feed">Abrir o mural</Link>
            : <a className="lbtn sm" href="/entrar" onClick={(e) => { e.preventDefault(); ir('/entrar'); }}>Entrar</a>}
        </div>
      </nav>
      <header className="hero" id="topo">
        <VideoTopo />
        <div className="in">
          <h1><img src="/img/logo.webp" alt="Hollow Page" width="720" height="298" /></h1>
          <p className="tag">Uma complexidade capaz de<br /><b>mudar o mundo</b></p>
        </div>
      </header>
      <main>
        <section className="wrap hk" id="hollow-knight" aria-label="Sobre Hollow Knight">
          {SECOES.map((s, i) => (
            <div key={s.alt} className={`hkrow${i % 2 ? '' : ' rev'}`}>
              <Cartas imgs={s.imgs} rotulo={s.alt} />
              <div><h2>{s.titulo}</h2>{s.texto}</div>
            </div>
          ))}
        </section>
        <section className="galeria" id="projeto" aria-labelledby="galeria-t">
          <div className="wrap cab">
            <div className="txt">
              <h2 id="galeria-t">Uma comunidade unida e criativa</h2>
              <p>Um mural de fãs para fãs, para encontrar e compartilhar artes de Hollow Knight. Estas são as mais salvas agora.</p>
            </div>
            <div className="acoes">
              <Link className="lbtn" to="/feed">Explorar o mural</Link>
              {famosas.length >= MIN_CARROSSEL && <Pausa />}
            </div>
          </div>
          {famosas.length >= MIN_CARROSSEL ? (
            <div className="esteiras" role="region" aria-label="As artes mais salvas da comunidade">
              <Esteira itens={linhaA} />
              <Esteira itens={linhaB} reverso />
            </div>
          ) : famosas.length > 0 && (
            /* com poucas artes, repetir a mesma em loop fica estranho: ficam paradas, lado a lado */
            <div className="wrap poucas" role="region" aria-label="As artes mais salvas da comunidade">
              {famosas.map((p) => <CartaArte key={p.id} p={p} />)}
            </div>
          )}
        </section>
        <section className="join" aria-label="Fazer parte">
          {/* cena oficial da Encruzilhada Esquecida, parada; as lumaflies (insetos de luz do jogo) flutuam por cima */}
          <div className="foco" aria-hidden="true">
            <div className="quadro"><img className="cena" src="/img/encruzilhada.webp" alt="" /></div>
          </div>
          <div className="lumaflies" aria-hidden="true">
            {LUMAFLIES.map((l, i) => <i key={i} style={l as React.CSSProperties} />)}
          </div>
          <div className="wrap">
            <div className="in">
              <p className="tag big">Uma complexidade capaz<br />de <b>mudar o mundo</b></p>
              {eu
                ? <Link className="lbtn" to="/feed">Abrir o mural</Link>
                : <a className="lbtn" href="/cadastro" onClick={(e) => { e.preventDefault(); ir('/cadastro'); }}>Fazer parte</a>}
            </div>
          </div>
        </section>
      </main>
      <footer className="foot wrap">
        <h2>Sobre mim</h2>
        <div className="about">
          <aside><img src="/img/tialves.webp" alt="Tiago Alves" /><b>Tiago Alves</b><span>Desenvolvedor front-end e designer de UX/UI</span></aside>
          <div className="txt">
            <p>Olá! Sabe esse cara aqui do lado? Sou eu. Sou formado em Análise e Desenvolvimento de Sistemas pela São Paulo Tech School e trabalho como desenvolvedor front-end e designer de UX/UI, criando interfaces do protótipo no Figma até o código em React.</p>
            <p>O Hollow Page nasceu como meu primeiro projeto individual na faculdade, com o tema de Hollow Knight: um jogo marcante em todos os aspectos, do design ao som, com uma história contada de um jeito sem igual. Agora ele ganha uma versão nova, refeita do zero.</p>
            <p>Fora do código, escuto muita música, de MPB a rock e eletrônica, e, coincidentemente, jogo muito Hollow Knight.</p>
          </div>
        </div>
        <div className="fbar">
          <div className="rules"><span>Termos de uso</span><span>Política de privacidade</span></div>
          <div className="soc">
            <a href="https://github.com/tialvesdev" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Icone n="gh" s={20} /></a>
            <a href="https://www.linkedin.com/in/ti-alves" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Icone n="li" s={20} /></a>
            <a href="mailto:tialves.dev@gmail.com" aria-label="E-mail"><Icone n="email" s={20} /></a>
            <span className="mailtxt">tialves.dev@gmail.com</span>
          </div>
          <span>© Hollow Page {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
