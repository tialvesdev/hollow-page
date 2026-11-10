import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { useBlocker, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LIMITES, TAGS, novoPostSchema, type Post } from '@hp/shared';
import { api, camposDeErro, mensagemDeErro } from '../api';
import { Campo, Moldura, useAviso, usePrenderFoco } from '../ui';

function Descartar({ ficar, descartar }: { ficar: () => void; descartar: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  usePrenderFoco(ref);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && ficar();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [ficar]);
  return (
    <div className="scrim" onClick={ficar}>
      <div className="modal confirm" ref={ref} role="alertdialog" aria-modal="true" aria-labelledby="dt" aria-describedby="dd" onClick={(e) => e.stopPropagation()}>
        <h2 id="dt">Descartar esta publicação?</h2>
        <p id="dd">O título, a descrição e a imagem que você escolheu serão perdidos.</p>
        <div className="mact">
          <button className="btn out" autoFocus onClick={ficar}>Continuar editando</button>
          <button className="btn danger" onClick={descartar}>Descartar</button>
        </div>
      </div>
    </div>
  );
}

export default function Publicar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const avisar = useAviso();
  const [f, setF] = useState({ titulo: '', descricao: '', tags: [] as string[] });
  const [img, setImg] = useState<{ arquivo: File; url: string } | null>(null);
  const [erros, setErros] = useState<Record<string, string | undefined>>({});
  const [geral, setGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const sujo = !publicado && !!(f.titulo.trim() || f.descricao.trim() || img || f.tags.length);
  const bloqueio = useBlocker(({ currentLocation, nextLocation }) => sujo && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!sujo) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [sujo]);
  useEffect(() => () => { if (img) URL.revokeObjectURL(img.url); }, [img]);

  const escolher = (a: File | undefined) => {
    if (!a) return;
    if (a.size > LIMITES.imagemMB * 1024 * 1024) return setErros({ ...erros, imagem: `A imagem passa do limite de ${LIMITES.imagemMB} MB. Escolha um arquivo menor.` });
    setErros({ ...erros, imagem: undefined });
    setImg({ arquivo: a, url: URL.createObjectURL(a) });
  };

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    const r = novoPostSchema.safeParse(f);
    const e: Record<string, string> = {};
    if (!r.success) for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
    if (!img) e.imagem = 'Escolha uma imagem para publicar.';
    setErros(e);
    if (Object.keys(e).length) return;
    setEnviando(true); setGeral(null);
    try {
      const fd = new FormData();
      fd.append('titulo', f.titulo);
      fd.append('descricao', f.descricao);
      fd.append('tags', f.tags.join(','));
      fd.append('imagem', img!.arquivo);
      const post = await api<Post>('/posts', { method: 'POST', body: fd });
      flushSync(() => setPublicado(true));
      qc.invalidateQueries();
      avisar('Publicado');
      navigate(`/perfil?post=${post.id}`);
    } catch (err) {
      const c = camposDeErro(err);
      if (Object.keys(c).length) setErros(c); else setGeral(mensagemDeErro(err));
      setEnviando(false);
    }
  };

  return (
    <div className="formpage">
      <Moldura largura={1060}>
        <form className="pubgrid" onSubmit={enviar} noValidate>
          <div className="col">
            <h1>Nova publicação</h1>
            {geral && <p className="erro-box" role="alert">{geral}</p>}
            <Campo id="pt" rotulo="Título" erro={erros.titulo}>
              <input id="pt" className="inp" maxLength={LIMITES.titulo} value={f.titulo} aria-invalid={!!erros.titulo} onChange={(x) => { setF({ ...f, titulo: x.target.value }); setErros({ ...erros, titulo: undefined }); }} />
            </Campo>
            <Campo id="pd" rotulo="Descrição" erro={erros.descricao} extra={<span className="cnt">{f.descricao.length}/{LIMITES.descricao}</span>}>
              <textarea id="pd" className="inp" maxLength={LIMITES.descricao} value={f.descricao} onChange={(x) => setF({ ...f, descricao: x.target.value })} />
            </Campo>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="grp-t" id="tg">Atributos (ajudam no filtro)</span>
              <div className="chips" role="group" aria-labelledby="tg">
                {TAGS.map((t) => (
                  <button type="button" key={t} className="chip" aria-pressed={f.tags.includes(t)} onClick={() => setF({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] })}>{t}</button>
                ))}
              </div>
            </div>
            <img src="/img/chars-on-bench.webp" alt="" style={{ width: 'min(260px,70%)', alignSelf: 'center', marginTop: 8 }} />
          </div>
          <div className="col drop">
            <div className={`pv${img ? ' has' : ''}`} style={{ backgroundImage: img ? `url(${img.url})` : 'none' }}>{!img && <img src="/img/knight-crying.webp" alt="" />}</div>
            <small>{img ? img.arquivo.name : 'Nenhuma foto selecionada'}</small>
            <label className="lnk" htmlFor="pf">{img ? 'Trocar foto' : 'Escolher foto'}</label>
            <input id="pf" className="sr" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(x) => escolher(x.target.files?.[0])} />
            {erros.imagem && <span className="err" role="alert">{erros.imagem}</span>}
            <button className="btn" type="submit" disabled={enviando} style={{ marginTop: 'auto', minWidth: 220 }}>{enviando ? 'Publicando…' : 'Publicar'}</button>
          </div>
        </form>
      </Moldura>
      {bloqueio.state === 'blocked' && <Descartar ficar={() => bloqueio.reset()} descartar={() => bloqueio.proceed()} />}
    </div>
  );
}
