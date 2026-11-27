import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { CAPAS, type UsuarioPublico } from '@hp/shared';
import { chaves, mensagemDeErro, useEstatisticas, useEu, useUsuario } from '../api';
import { Avatar, Colunas, Esq, FotoCapa, Icone, Vazio, diaMesDeDia, mesAno, useColunas } from '../ui';
import { Mural, useAbrirPost } from './Feed';
import { useSair } from './Shell';

const fmtNum = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function Estatisticas({ u }: { u: UsuarioPublico }) {
  const { data, isPending, isError, error } = useEstatisticas(true);
  const abrir = useAbrirPost();
  if (isPending)
    return (
      <div className="esq-est" aria-busy="true" aria-label="Carregando estatísticas">
        <div className="kpis">{[0, 1, 2].map((i) => <Esq key={i} h={92} />)}</div>
        <Esq h={300} />
      </div>
    );
  if (isError) return <p className="erro-box" role="alert">{mensagemDeErro(error)}</p>;
  if (!data.porDia.length)
    return <Vazio item="cacador" titulo="Sem números por enquanto" texto="As estatísticas começam a contar a partir da primeira arte publicada." acao={<Link className="btn" to="/publicar">Publicar arte</Link>} />;

  const max = Math.max(...data.porDia.map((d) => d.publicacoes), 1);
  const meses = [...new Set(data.porDia.map((d) => mesAno(d.dia)))];
  const periodo = meses.length === 1 ? meses[0] : `${meses[0]} a ${meses[meses.length - 1]}`;
  const kpis = [
    { v: fmtNum(u.publicacoes), l: u.publicacoes === 1 ? 'publicação no seu perfil' : 'publicações no seu perfil' },
    { v: fmtNum(data.totalSalvos), l: data.totalSalvos === 1 ? 'vez que salvaram suas artes' : 'vezes que salvaram suas artes' },
    { v: fmtNum(u.publicacoes ? data.totalSalvos / u.publicacoes : 0), l: 'salvamentos por arte, em média' },
  ];
  const vezes = (n: number) => (n === 0 ? 'ainda não foi salva' : `salva ${n} ${n === 1 ? 'vez' : 'vezes'}`);
  const destaques = [
    data.maisSalvo && { r: 'Mais salva', p: data.maisSalvo },
    data.menosSalvo && data.menosSalvo.id !== data.maisSalvo?.id && { r: 'Menos salva', p: data.menosSalvo },
  ].filter(Boolean) as { r: string; p: NonNullable<typeof data.maisSalvo> }[];

  return (
    <>
      <div className="kpis">
        {kpis.map((k) => <div key={k.l} className="kpi pedra"><b>{k.v}</b><span>{k.l}</span></div>)}
      </div>
      <figure className="grafico pedra">
        <figcaption><span className="t-nome">Publicações por dia</span><span className="apoio">{periodo}</span></figcaption>
        <div className="barras" role="img" aria-label={`Publicações por dia: ${data.porDia.map((d) => `${diaMesDeDia(d.dia)}, ${d.publicacoes}`).join('; ')}`}>
          <div className="area">
            {data.porDia.map((d) => (
              <div key={d.dia} className="col" aria-hidden="true">
                <b>{d.publicacoes}</b>
                <i style={{ height: Math.round((d.publicacoes / max) * 160) }} />
              </div>
            ))}
          </div>
          <div className="dias" aria-hidden="true">{data.porDia.map((d) => <span key={d.dia}>{diaMesDeDia(d.dia)}</span>)}</div>
        </div>
      </figure>
      {destaques.length > 0 && (
        <div className="destaques">
          {destaques.map(({ r, p }) => (
            <button key={r} className="dest pedra" onClick={() => abrir(p.id)}>
              <img src={p.imagemUrl} alt="" />
              <span><span className="r">{r}</span><span className="t-nome">{p.titulo}</span><span className="apoio">{vezes(p.salvos)}</span></span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

type Aba = 'posts' | 'estatisticas';

/**
 * Perfil como vitrine de quem desenha: a capa no topo, o avatar sobreposto à borda dela e, ao lado,
 * nome, bio, link e números; embaixo, as artes na largura toda. No seu perfil há também as estatísticas.
 * (Os salvos são privados e ficam na página Salvos.)
 */
export default function Perfil() {
  const { id: param } = useParams();
  const { data: eu } = useEu();
  const id = param ?? eu?.id;
  const meu = id === eu?.id;
  const { data: u, isError, error } = useUsuario(id);
  const { data: est } = useEstatisticas(!!meu);
  const [params, setParams] = useSearchParams();
  const sair = useSair();
  const [colunas, mudarColunas] = useColunas();
  const aba: Aba = meu && params.get('aba') === 'estatisticas' ? 'estatisticas' : 'posts';
  const irAba = (a: Aba) => {
    const n = new URLSearchParams(params);
    if (a === 'posts') n.delete('aba'); else n.set('aba', a);
    setParams(n, { replace: true });
  };

  // o endereço antigo da aba de salvos leva à página nova
  if (meu && params.get('aba') === 'salvos') return <Navigate to="/salvos" replace />;
  if (isError) return <p className="erro-box" role="alert">{mensagemDeErro(error)}</p>;
  if (!u)
    return (
      <div className="perfil" aria-busy="true" aria-label="Carregando perfil">
        <Esq className="perfil-capa" />
        <div className="perfil-cab">
          <Esq w={136} h={136} r="50%" className="perfil-av" />
          <div className="perfil-id"><Esq w={260} h={34} /><Esq w={360} h={14} /><Esq w={220} h={14} /></div>
        </div>
        <div className="esq-grade tres">{Array.from({ length: 6 }, (_, i) => <Esq key={i} h={200} />)}</div>
      </div>
    );
  const capa = CAPAS.find((c) => c.id === u.capa) ?? CAPAS[3];
  const primeiroNome = u.nome.split(' ')[0];

  return (
    <div className="perfil">
      <div className="perfil-capa">
        <FotoCapa capa={capa} alt={`Capa: ${capa.nome}`} />
      </div>
      <header className="perfil-cab">
        <Avatar url={u.fotoUrl} nome={u.nome} tamanho={136} className="perfil-av" />
        <div className="perfil-id">
          <h1 className="t-pag">{u.nome}</h1>
          {u.bio && <p className="bio">{u.bio}</p>}
          <div className="perfil-meta">
            <span><b>{fmtNum(u.publicacoes)}</b> {u.publicacoes === 1 ? 'arte' : 'artes'}</span>
            {meu && est && <span><b>{fmtNum(est.totalSalvos)}</b> {est.totalSalvos === 1 ? 'vez salva' : 'vezes salvas'}</span>}
            {u.link && (
              <a className="link" href={u.link} target="_blank" rel="noopener noreferrer ugc">
                <Icone n="link" s={16} traco={2} />{u.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
            )}
          </div>
        </div>
        {meu && (
          <div className="perfil-acoes">
            <Link className="btn sec" to="/editar-perfil">Editar perfil</Link>
            <button className="btn perigo so-cel" onClick={sair}><Icone n="sair" s={18} traco={2} />Sair</button>
          </div>
        )}
      </header>

      <section className="perfil-conteudo" aria-label={meu ? 'Suas artes' : `Artes de ${primeiroNome}`}>
        {/* mesma barra nos dois perfis: abas (ou o título da única seção) à esquerda, colunas da grade à direita */}
        <div className="barra-perfil">
          {meu ? (
            <div className="abas-perfil" role="tablist" aria-label="Seções do perfil">
              {([['posts', 'Publicações'], ['estatisticas', 'Estatísticas']] as const).map(([k, l]) => (
                <button key={k} role="tab" id={`aba-${k}`} aria-selected={aba === k} aria-controls="painel-perfil" onClick={() => irAba(k)}>{l}</button>
              ))}
            </div>
          ) : (
            <div className="abas-perfil"><h2 className="aba-unica">Publicações</h2></div>
          )}
          {aba === 'posts' && u.publicacoes > 0 && <Colunas n={colunas} mudar={mudarColunas} />}
        </div>
        <div id="painel-perfil" className="painel-perfil" role={meu ? 'tabpanel' : undefined} aria-labelledby={meu ? `aba-${aba}` : undefined}>
          {aba === 'estatisticas' ? (
            <Estatisticas u={u} />
          ) : (
            <Mural
              key={id}
              grade
              colunas={colunas}
              chave={chaves.postsDe(id!)}
              caminho={(c) => `/usuarios/${id}/posts?limite=12${c ? `&cursor=${c}` : ''}`}
              vazio={
                meu ? (
                  <Vazio titulo="Nenhuma arte publicada" texto="A primeira que você publicar aparece aqui e no mural." acao={<Link className="btn" to="/publicar">Publicar arte</Link>} />
                ) : (
                  <Vazio titulo={`${primeiroNome} ainda não publicou artes`} />
                )
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
