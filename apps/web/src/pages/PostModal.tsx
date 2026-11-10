import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Post } from '@hp/shared';
import { api, mensagemDeErro, useAtualizarPost, useEu, usePost } from '../api';
import { Avatar, Icone, dataHora, useAviso, usePrenderFoco } from '../ui';

export default function PostModal() {
  const [params, setParams] = useSearchParams();
  const id = params.get('post');
  if (!id) return null;
  const fechar = () => {
    const n = new URLSearchParams(params);
    n.delete('post');
    setParams(n);
  };
  return <Conteudo id={id} fechar={fechar} />;
}

function Conteudo({ id, fechar }: { id: string; fechar: () => void }) {
  const ref = useRef<HTMLElement>(null);
  usePrenderFoco(ref);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const avisar = useAviso();
  const atualizar = useAtualizarPost();
  const { data: eu } = useEu();
  const { data: p, isPending, isError, error } = usePost(id);
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
      avisar(novo.salvoPorMim ? 'Postagem salva' : 'Removida dos salvos');
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
  const irPerfil = (autorId: string) => navigate(eu ? `/perfil/${autorId}` : '/entrar');

  return (
    <div className="scrim" onClick={fechar}>
      <article className="modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="mt" aria-busy={isPending} onClick={(e) => e.stopPropagation()}>
        <div className="hd">
          <button className="xbtn" aria-label="Fechar" onClick={fechar} autoFocus><Icone n="x" /></button>
          {p ? <button className="author" onClick={() => irPerfil(p.autor.id)}><Avatar url={p.autor.fotoUrl} tamanho={44} />{p.autor.nome}</button> : <span />}
          <span />
        </div>
        {isPending && <div className="carregando">Carregando…</div>}
        {isError && <p className="erro-box" role="alert" id="mt">{mensagemDeErro(error)}</p>}
        {p && (
          <>
            <div className="mbody">
              <figure><img src={p.imagemUrl} alt={p.titulo} width={p.largura} height={p.altura} /><figcaption>{dataHora(p.criadoEm)}</figcaption></figure>
              <div className="mtxt">
                <h2 id="mt">{p.titulo}</h2>
                {p.descricao && <p>{p.descricao}</p>}
                {p.tags.length > 0 && <div className="chips">{p.tags.map((t) => <span key={t} className="chip" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'default' }}>{t}</span>)}</div>}
                <span className="note">Salva {p.salvos} {p.salvos === 1 ? 'vez' : 'vezes'}{eu?.id === p.autor.id ? ' · publicação sua' : ''}</span>
              </div>
            </div>
            {apagar ? (
              <div className="mact" role="group" aria-label="Confirmar exclusão">
                <span style={{ alignSelf: 'center', color: 'var(--suave)' }}>Apagar esta publicação de vez?</span>
                <button className="btn out" onClick={() => setApagar(false)} autoFocus>Cancelar</button>
                <button className="btn danger" disabled={ocupado} onClick={() => confirmarApagar(p)}>Apagar</button>
              </div>
            ) : (
              <div className="mact">
                <a className="btn out" href={`/api/posts/${p.id}/baixar`} download><Icone n="dl" s={20} />Baixar</a>
                {eu ? (
                  <button className="btn" disabled={ocupado} aria-pressed={p.salvoPorMim} onClick={() => salvar(p)}><Icone n="save" s={20} cheio={p.salvoPorMim} />{p.salvoPorMim ? 'Salvo' : 'Salvar'}</button>
                ) : (
                  <button className="btn" onClick={() => navigate(`/entrar?volta=${encodeURIComponent(`/feed?post=${p.id}`)}`)}>Entrar para salvar</button>
                )}
                {eu?.id === p.autor.id && <button className="btn danger" onClick={() => setApagar(true)}><Icone n="trash" s={20} />Apagar</button>}
              </div>
            )}
          </>
        )}
      </article>
    </div>
  );
}
