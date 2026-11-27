import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginaPosts, Post } from '@hp/shared';
import { api, mensagemDeErro, useAtualizarPost, useEu, usePost, useUsuario } from '../api';
import { Avatar, Esq, Icone, dataCurta, useAviso, usePrenderFoco } from '../ui';

/** O post abre por cima da página atual (?post=id), em tela cheia, sem perder a rolagem do mural. */
export default function PostModal() {
  const [params, setParams] = useSearchParams();
  const id = params.get('post');
  useEffect(() => {
    if (!id) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = antes; };
  }, [id]);
  if (!id) return null;
  const fechar = () => {
    const n = new URLSearchParams(params);
    n.delete('post');
    setParams(n);
  };
  const abrir = (outro: string) => {
    const n = new URLSearchParams(params);
    n.set('post', outro);
    setParams(n, { replace: true });
  };
  return <Conteudo key={id} id={id} fechar={fechar} abrir={abrir} />;
}

function MaisDe({ p, abrir, irPerfil }: { p: Post; abrir: (id: string) => void; irPerfil: () => void }) {
  const { data } = useQuery({ queryKey: ['maisDe', p.autor.id], queryFn: () => api<PaginaPosts>(`/usuarios/${p.autor.id}/posts?limite=4`) });
  const outros = (data?.itens ?? []).filter((x) => x.id !== p.id).slice(0, 2);
  if (!outros.length) return null;
  return (
    <section className="mais-de" aria-labelledby="mais-de-t">
      <h2 id="mais-de-t" className="t-nome">Mais de {p.autor.nome.split(' ')[0]}</h2>
      <div className="tiles">
        {outros.map((o) => <button key={o.id} onClick={() => abrir(o.id)} aria-label={o.titulo}><img src={o.imagemUrl} alt="" loading="lazy" /></button>)}
        <button className="ver" onClick={irPerfil}>Ver perfil</button>
      </div>
    </section>
  );
}

function Conteudo({ id, fechar, abrir }: { id: string; fechar: () => void; abrir: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  usePrenderFoco(ref);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const qc = useQueryClient();
  const avisar = useAviso();
  const atualizar = useAtualizarPost();
  const { data: eu } = useEu();
  const { data: p, isPending, isError, error } = usePost(id);
  const { data: autor } = useUsuario(p?.autor.id);
  const [ocupado, setOcupado] = useState(false);
  const [apagar, setApagar] = useState(false);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && fechar();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [fechar]);

  const salvar = async (post: Post) => {
    setOcupado(true);
    try {
      const novo = await api<Post>(`/posts/${post.id}/salvo`, { method: post.salvoPorMim ? 'DELETE' : 'PUT' });
      atualizar(novo);
      avisar(novo.salvoPorMim ? 'Arte salva' : 'Removida dos salvos');
    } catch (e) {
      avisar(mensagemDeErro(e));
    } finally {
      setOcupado(false);
    }
  };
  const confirmarApagar = async (post: Post) => {
    setOcupado(true);
    try {
      await api(`/posts/${post.id}`, { method: 'DELETE' });
      qc.invalidateQueries();
      fechar();
      avisar('Publicação apagada');
    } catch (e) {
      avisar(mensagemDeErro(e));
      setOcupado(false);
    }
  };
  const copiar = async (post: Post) => {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      avisar('Link copiado');
    } catch {
      avisar(`Não deu para copiar. O link é ${url}`);
    }
  };
  const irPerfil = (autorId: string) => navigate(eu ? `/perfil/${autorId}` : '/entrar');
  const irTag = (t: string) => navigate(`/feed?tags=${encodeURIComponent(t)}`);
  const voltar = pathname === '/feed' ? 'Voltar ao mural' : pathname.startsWith('/perfil') ? 'Voltar ao perfil' : 'Voltar';

  return (
    <div className="sobre" ref={ref} role="dialog" aria-modal="true" aria-labelledby="pt" aria-busy={isPending}>
      <div className="post">
        <button className="btn sec" onClick={fechar} autoFocus><Icone n="voltar" s={18} traco={2} />{voltar}</button>
        {isPending && (
          <div className="corpo" aria-label="Carregando publicação">
            <Esq className="palco" />
            <div className="esq-painel"><Esq w="40%" h={14} /><Esq w="80%" h={38} /><Esq w="100%" h={14} /><Esq w="90%" h={14} /><Esq w="55%" h={56} r={28} /><Esq w="100%" h={46} /></div>
          </div>
        )}
        {isError && <p className="erro-box" role="alert" id="pt">{mensagemDeErro(error)}</p>}
        {p && (
          <div className="corpo">
            <div className="palco">
              <img className="fundo" src={p.imagemUrl} alt="" aria-hidden="true" />
              <img className="obra" src={p.imagemUrl} alt={p.descricao ? `${p.titulo}: ${p.descricao}` : p.titulo} width={p.largura} height={p.altura} />
            </div>
            <aside className="painel-post lunar p-lemm">
              <div className="cabeca">
                <h1 id="pt" className="t-pag">{p.titulo}</h1>
                <time className="apoio" dateTime={p.criadoEm}>{dataCurta(p.criadoEm)}</time>
              </div>
              {p.descricao && <p className="desc">{p.descricao}</p>}
              <button className="autor" onClick={() => irPerfil(p.autor.id)}>
                <Avatar url={p.autor.fotoUrl} nome={p.autor.nome} tamanho={56} />
                <span>
                  <b>{p.autor.nome}</b>
                  <small>{autor ? `${autor.publicacoes} ${autor.publicacoes === 1 ? 'publicação' : 'publicações'}` : ' '}</small>
                </span>
              </button>
              {p.tags.length > 0 && (
                <ul className="chips" aria-label="Atributos" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {p.tags.map((t) => <li key={t}><button className="chip" onClick={() => irTag(t)}>{t}</button></li>)}
                </ul>
              )}
              <p className="apoio">Salva {p.salvos} {p.salvos === 1 ? 'vez' : 'vezes'}{eu?.id === p.autor.id ? ' · publicação sua' : ''}</p>
              {apagar ? (
                <div className="confirma" role="group" aria-label="Confirmar exclusão">
                  <span>Apagar esta publicação de vez? Não dá para desfazer.</span>
                  <div className="acoes-post">
                    <button className="btn sec" onClick={() => setApagar(false)} autoFocus>Cancelar</button>
                    <button className="btn perigo" disabled={ocupado} onClick={() => confirmarApagar(p)}>Apagar</button>
                  </div>
                </div>
              ) : (
                <div className="acoes-post barra">
                  {eu ? (
                    <button className="btn" disabled={ocupado} aria-pressed={p.salvoPorMim} onClick={() => salvar(p)}>
                      <Icone n="salvo" s={18} traco={2} cheio={p.salvoPorMim} />{p.salvoPorMim ? 'Salva' : 'Salvar'}
                    </button>
                  ) : (
                    <button className="btn" onClick={() => navigate(`/entrar?volta=${encodeURIComponent(`/feed?post=${p.id}`)}`)}>Entrar para salvar</button>
                  )}
                  <a className="btn sec baixar" href={`/api/posts/${p.id}/baixar`} download aria-label="Baixar"><Icone n="baixar" s={18} traco={2} /><span className="rot-baixar">Baixar</span></a>
                  <button className="btn sec ico" aria-label="Copiar link" onClick={() => copiar(p)}><Icone n="link" s={18} traco={2} /></button>
                  {eu?.id === p.autor.id && <button className="btn perigo ico" aria-label="Apagar publicação" onClick={() => setApagar(true)}><Icone n="lixo" s={18} traco={2} /></button>}
                </div>
              )}
              <MaisDe p={p} abrir={abrir} irPerfil={() => irPerfil(p.autor.id)} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
