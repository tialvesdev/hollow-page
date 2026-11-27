import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { useBlocker, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LIMITES, TAGS, novoPostSchema, type Post } from '@hp/shared';
import { api, camposDeErro, mensagemDeErro } from '../api';
import { Campo, Girando, Icone, tamanhoArquivo, useArquivoImagem, useAviso, usePrenderFoco } from '../ui';

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
      <div className="dialogo lunar p-leg" ref={ref} role="alertdialog" aria-modal="true" aria-labelledby="dt" aria-describedby="dd" onClick={(e) => e.stopPropagation()}>
        <h2 id="dt" className="t-nome">Descartar esta publicação?</h2>
        <p id="dd">O título, a descrição e a imagem que você escolheu serão perdidos.</p>
        <div className="acoes-post">
          <button className="btn sec" autoFocus onClick={ficar}>Continuar editando</button>
          <button className="btn perigo" onClick={descartar}>Descartar</button>
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
  const [img, setImg] = useArquivoImagem();
  const [erros, setErros] = useState<Record<string, string | undefined>>({});
  const [geral, setGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const [solta, setSolta] = useState(false);
  const sujo = !publicado && !!(f.titulo.trim() || f.descricao.trim() || img || f.tags.length);
  const bloqueio = useBlocker(({ currentLocation, nextLocation }) => sujo && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!sujo) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', aviso);
    return () => window.removeEventListener('beforeunload', aviso);
  }, [sujo]);

  const escolher = (a: File | undefined) => {
    if (!a) return;
    if (!TIPOS.includes(a.type)) return setErros({ ...erros, imagem: 'Use uma imagem JPG, PNG, WebP ou GIF.' });
    if (a.size > LIMITES.imagemMB * 1024 * 1024) return setErros({ ...erros, imagem: `A imagem passa do limite de ${LIMITES.imagemMB} MB. Escolha um arquivo menor.` });
    setErros({ ...erros, imagem: undefined });
    setImg(a);
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
    <>
      <header className="cabeca-pub">
        <h1 className="t-pag">Publicar arte</h1>
        <p className="apoio">Ela aparece no mural e no seu perfil assim que for publicada.</p>
      </header>
      <form className="pub" onSubmit={enviar} noValidate>
        <div className="col">
          <div
            className={`envio${img ? ' tem' : ''}${solta ? ' solta' : ''}${erros.imagem ? ' invalido' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setSolta(true); }}
            onDragLeave={() => setSolta(false)}
            onDrop={(e) => { e.preventDefault(); setSolta(false); escolher(e.dataTransfer.files?.[0]); }}
          >
            {img ? (
              <img className="prev" src={img.url} alt="Prévia da imagem escolhida" />
            ) : (
              <label className="vaz" htmlFor="pf" style={{ cursor: 'pointer' }}>
                {/* o mapa enrolado que a Iselda vende: ainda falta a arte para "desenrolar" */}
                <img className="item-vazio" src="/img/itens/mapa.webp" width={125} height={63} alt="" />
                <b>Arraste a imagem para cá</b>
                <span>ou clique para escolher. JPG, PNG, WebP ou GIF, até {LIMITES.imagemMB} MB.</span>
              </label>
            )}
          </div>
          <div className="arquivo">
            <span>{img ? `${img.arquivo.name} · ${tamanhoArquivo(img.arquivo.size)}` : 'Nenhuma imagem escolhida'}</span>
            <label className="btn sec peq" htmlFor="pf">{img ? 'Trocar imagem' : 'Escolher imagem'}</label>
            <input id="pf" className="sr" type="file" accept={TIPOS.join(',')} aria-invalid={!!erros.imagem} aria-describedby={erros.imagem ? 'pf-msg' : undefined}
              onChange={(x) => { escolher(x.target.files?.[0]); x.target.value = ''; }} />
          </div>
          {erros.imagem && <span className="msg erro" role="alert" id="pf-msg">{erros.imagem}</span>}
        </div>
        <section className="form-lunar lunar p-iselda">
          {geral && <p className="erro-box" role="alert">{geral}</p>}
          <Campo id="pt" rotulo="Título" erro={erros.titulo}>
            <input id="pt" className="inp" maxLength={LIMITES.titulo} value={f.titulo} aria-invalid={!!erros.titulo} aria-describedby={erros.titulo ? 'pt-msg' : undefined}
              onChange={(x) => { setF({ ...f, titulo: x.target.value }); setErros({ ...erros, titulo: undefined }); }} />
          </Campo>
          <Campo id="pd" rotulo="Descrição" erro={erros.descricao} extra={<span className="cont" aria-live="polite">{f.descricao.length}/{LIMITES.descricao}</span>}>
            <textarea id="pd" className="inp" rows={4} maxLength={LIMITES.descricao} value={f.descricao} onChange={(x) => setF({ ...f, descricao: x.target.value })} />
          </Campo>
          <fieldset>
            <legend className="rot">Atributos</legend>
            <div className="chips">
              {TAGS.map((t) => (
                <button type="button" key={t} className="chip" aria-pressed={f.tags.includes(t)} onClick={() => setF({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] })}>{t}</button>
              ))}
            </div>
          </fieldset>
          <button className="btn cheio" type="submit" disabled={enviando} aria-busy={enviando} style={{ marginTop: 6 }}>{enviando ? <><Girando />Publicando…</> : 'Publicar'}</button>
        </section>
      </form>
      {bloqueio.state === 'blocked' && <Descartar ficar={() => bloqueio.reset()} descartar={() => bloqueio.proceed()} />}
    </>
  );
}
