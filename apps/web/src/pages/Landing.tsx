import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ACENTOS, type PaginaPosts } from '@hp/shared';
import { api } from '../api';
import { Icone, Paleta, useIr } from '../ui';

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

/* apanhadores de sonhos subindo e girando ao fundo, nas cores da paleta */
function Sonhos() {
  const ref = useRef<HTMLCanvasElement>(null);
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
    const tingir = (cor: string, blur: number) => {
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
      const cores = ACENTOS.map((a) => a.cor);
      sprites = [...cores.map((c) => tingir(c, 0)), ...cores.map((c) => tingir(c, 4)), ...cores.map((c) => tingir(c, 9))];
      resize(); parts = Array.from({ length: quantos() }, () => nova(true)); last = performance.now(); desenhar(last);
    };
    const aoRedimensionar = () => { resize(); const n = quantos(); while (parts.length < n) parts.push(nova(true)); parts.length = n; };
    window.addEventListener('resize', aoRedimensionar);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', aoRedimensionar); };
  }, []);
  return <canvas className="sonhos" ref={ref} aria-hidden="true" />;
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

const SECOES: { imgs: [string, string]; alt: string; titulo: ReactNode; texto: ReactNode }[] = [
  { imgs: ['dirtmouth-well', 'dirtmouth-bench'], alt: 'Dirtmouth', titulo: <>Explore o reino esquecido de <span className="lifeblood">Hallownest</span></>,
    texto: <><p>Embaixo da cidade desbotada de Dirtmouth descansa um vasto reino antigo. Muitos são atraídos sob a superfície, à procura de riqueza, glória ou respostas para velhos segredos.</p><p style={{ marginTop: 10 }}>Como o enigmático Cavaleiro, você vai cruzar as profundezas, desvendar seus mistérios e conquistar seus males.</p></> },
  { imgs: ['colosseum-of-fools', 'the-hive'], alt: 'Coliseu dos Tolos e Colmeia', titulo: <>Sobreviva com o <span className="godmaster">reflexo mais afiado</span> que tiver</>,
    texto: <p>Jogabilidade é importante e é entregue em Hollow Knight, de mapas com ótimo <i>level design</i> e curva de aprendizado até o Coliseu dos Tolos para testar suas habilidades.</p> },
  { imgs: ['gods-and-nightmares', 'grimm-nightmare'], alt: 'Gods & Nightmares e Pesadelo do Grimm', titulo: <>Uma trilha <span className="grimm">assombrada</span> e <span className="grimm">orquestral</span></>,
    texto: <><p>Com uma ambientação assustadora, o jogo expressa cada sentimento da história e do lugar com seu visual e, principalmente, com suas músicas, por exemplo:</p><ul><li><span className="grimm">Vazio:</span> uma cidadezinha deserta com ventos uivantes;</li><li><span className="grimm">Melancolia:</span> a metrópole devastada com sons de chuva;</li><li><span className="grimm">Intensidade:</span> uma batalha em outro plano com o mestre de um culto.</li></ul></> },
  { imgs: ['crystal-bench', 'crystal-peak'], alt: 'Pico de Cristal', titulo: <>O jogo de insetos <span className="dreams">mais lindo</span> de todos</>,
    texto: <p>Justamente o inverso do que se imagina de um jogo de insetos: Hollow Knight tem áreas repletas de detalhes e uma ambientação impressionante, com luzes e efeitos gráficos que acentuam toda a sua essência.</p> },
];

export default function Landing() {
  const ir = useIr();
  const [, setParams] = useSearchParams();
  const [solida, setSolida] = useState(false);
  const { data } = useQuery({ queryKey: ['vitrine'], queryFn: () => api<PaginaPosts>('/posts?limite=20') });
  useEffect(() => {
    const f = () => setSolida(window.scrollY > 10);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const pular = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const posts = data?.itens ?? [];

  return (
    <div className="landing">
      <Sonhos />
      <nav className={`nav${solida ? ' solid' : ''}`} aria-label="Principal">
        <a className="logo" href="#topo" onClick={pular('topo')}><img src="/favicon.png" alt="" /><span className="sr">Hollow Page</span></a>
        <ul>
          <li><a href="#topo" onClick={pular('topo')}>Início</a></li>
          <li><a href="#hollow-knight" onClick={pular('hollow-knight')}>Hollow Knight</a></li>
          <li><a href="#projeto" onClick={pular('projeto')}>Projeto</a></li>
        </ul>
        <div className="r"><Paleta /><button className="btn sm" onClick={() => ir('/entrar')}>Entrar</button></div>
      </nav>
      <header className="hero" id="topo">
        <div className="in">
          <img src="/img/hp-logo.webp" alt="Hollow Page" />
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
        <section className="comm" id="projeto">
          <div className="wrap in">
            <h2>Uma comunidade unida e criativa</h2>
            <img className="grimmimg" src="/img/red-grimm.webp" alt="" />
            <p className="lead">Um mural de fãs para fãs, para encontrar e compartilhar artes de Hollow Knight. Fique à vontade para explorar e contribuir.</p>
            {posts.length > 0 && (
              <>
                <Pausa />
                <div className="marquee" aria-label="Publicações da comunidade">
                  <div className="track">
                    {[0, 1].map((k) => posts.map((p) => (
                      <button key={k + p.id} tabIndex={k ? -1 : 0} aria-hidden={k ? true : undefined} aria-label={`Ver ${p.titulo}`} onClick={() => setParams({ post: p.id })}>
                        <img src={p.imagemUrl} alt="" loading="lazy" />
                      </button>
                    )))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
        <section className="join">
          <div className="wrap" style={{ width: '100%', display: 'flex' }}>
            <div className="in">
              <p className="tag big">Uma complexidade capaz<br />de <b>mudar o mundo</b></p>
              <button className="btn" onClick={() => ir('/cadastro')}>Fazer parte</button>
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
            <a href="mailto:tialves.dev@gmail.com" aria-label="E-mail"><Icone n="mail" s={20} /></a>
            <span className="mailtxt">tialves.dev@gmail.com</span>
          </div>
          <span>© Hollow Page {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
