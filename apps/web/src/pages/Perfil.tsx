import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CAPAS } from '@hp/shared';
import { chaves, mensagemDeErro, useEstatisticas, useEu, useUsuario } from '../api';
import { Avatar, Icone } from '../ui';
import { Mural } from './Feed';
import { useSair } from './Shell';

const fmtDia = (d: string) => d.split('-').reverse().slice(0, 2).join('/');

function Estatisticas() {
  const { data, isPending, isError, error } = useEstatisticas(true);
  const navigate = useNavigate();
  if (isPending) return <div className="carregando">Carregando…</div>;
  if (isError) return <p className="erro-box" role="alert">{mensagemDeErro(error)}</p>;
  if (!data.porDia.length)
    return <div className="empty"><img src="/img/knight-crying.webp" alt="" /><p>Publique algo para ver suas estatísticas</p></div>;

  const vals = data.porDia.map((d) => d.publicacoes);
  const max = Math.max(...vals, 1);
  const W = 560, H = 220, L = 34, B = 34, T = 14, R = 10;
  const passo = (W - L - R) / data.porDia.length, larg = Math.min(54, passo * 0.6);
  const abrir = (id: string) => navigate({ search: `?post=${id}` });
  const Kpi = ({ id, img, v, l }: { id: string; img: string; v: string; l: string }) => (
    <button className="kpi" style={{ cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }} onClick={() => abrir(id)}>
      <img src={img} alt="" /><div><div className="v">{v}</div><div className="l">{l}</div></div>
    </button>
  );
  return (
    <div className="adv">
      <div className="chart">
        <h3>Publicações por dia</h3>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Publicações por dia: ${data.porDia.map((d) => `${fmtDia(d.dia)} ${d.publicacoes}`).join(', ')}`}>
          {Array.from({ length: max + 1 }, (_, t) => {
            const y = H - B - ((H - B - T) * t) / max;
            return <g key={t}><line x1={L} x2={W - R} y1={y} y2={y} stroke="#2B2932" /><text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9B98A3">{t}</text></g>;
          })}
          {data.porDia.map((d, i) => {
            const h = ((H - B - T) * d.publicacoes) / max, x = L + passo * i + (passo - larg) / 2;
            return <g key={d.dia}><rect x={x} y={H - B - h} width={larg} height={h} rx="4" fill="var(--acento)" /><text x={x + larg / 2} y={H - B + 18} textAnchor="middle" fontSize="11" fill="#9B98A3">{fmtDia(d.dia)}</text></g>;
          })}
        </svg>
      </div>
      <div className="kpis">
        <div className="kpi"><div><div className="v">{data.totalSalvos}</div><div className="l">vezes que suas publicações foram salvas</div></div></div>
        {data.maisSalvo && <Kpi id={data.maisSalvo.id} img={data.maisSalvo.imagemUrl} v={`${data.maisSalvo.salvos}x`} l={`Post mais salvo: ${data.maisSalvo.titulo}`} />}
        {data.menosSalvo && <Kpi id={data.menosSalvo.id} img={data.menosSalvo.imagemUrl} v={`${data.menosSalvo.salvos}x`} l={`Post menos salvo: ${data.menosSalvo.titulo}`} />}
      </div>
    </div>
  );
}

export default function Perfil() {
  const { id: param } = useParams();
  const { data: eu } = useEu();
  const id = param ?? eu?.id;
  const meu = id === eu?.id;
  const { data: u, isError, error } = useUsuario(id);
  const navigate = useNavigate();
  const sair = useSair();
  const [aba, setAba] = useState<'posts' | 'salvos' | 'estatisticas'>('posts');
  const abaAtual = meu ? aba : 'posts';

  if (isError) return <div className="page"><p className="erro-box" role="alert">{mensagemDeErro(error)}</p></div>;
  if (!u) return <div className="carregando">Carregando…</div>;
  const capa = CAPAS.find((c) => c.id === u.capa) ?? CAPAS[3];
  const abas = meu ? ([['posts', 'POSTS'], ['salvos', 'SALVOS'], ['estatisticas', 'ESTATÍSTICAS']] as const) : ([['posts', 'POSTS']] as const);

  return (
    <div>
      <div className="cover" style={{ backgroundImage: `url(/capas/${capa.id}.webp)` }} role="img" aria-label={`Capa: ${capa.nome}`} />
      <div className="phead">
        <Avatar url={u.fotoUrl} tamanho={132} />
        <div className="nm"><h1>{u.nome}</h1><small>{u.publicacoes} {u.publicacoes === 1 ? 'publicação' : 'publicações'}</small></div>
        <div className="acts">
          {meu ? (
            <>
              <button className="btn sm" onClick={() => navigate('/editar-perfil')}><Icone n="edit" s={18} />Editar perfil</button>
              <button className="btn sm danger mob" onClick={sair}><Icone n="out" s={18} />Sair</button>
            </>
          ) : (
            <button className="btn sm out" onClick={() => navigate('/perfil')}>Ver meu perfil</button>
          )}
        </div>
      </div>
      <section className="pbox">
        <div className="tabs" role="tablist">
          {abas.map(([k, l]) => <button key={k} role="tab" aria-selected={abaAtual === k} onClick={() => setAba(k)}>{l}</button>)}
        </div>
        {abaAtual === 'estatisticas' ? (
          <Estatisticas />
        ) : (
          <Mural
            key={abaAtual + id}
            grade
            chave={abaAtual === 'salvos' ? chaves.salvos : chaves.postsDe(id!)}
            caminho={(c) => `${abaAtual === 'salvos' ? '/usuarios/eu/salvos' : `/usuarios/${id}/posts`}?limite=12${c ? `&cursor=${c}` : ''}`}
            vazio={
              <div className="empty">
                <img src="/img/knight-crying.webp" alt="" />
                <p>{abaAtual === 'salvos' ? 'Você não salvou nenhuma postagem ainda' : meu ? 'Você não fez nenhuma postagem ainda' : 'Nenhuma postagem por aqui'}</p>
                {meu && abaAtual === 'posts' && <button className="btn sm" onClick={() => navigate('/publicar')}>Fazer a primeira publicação</button>}
              </div>
            }
          />
        )}
      </section>
    </div>
  );
}
