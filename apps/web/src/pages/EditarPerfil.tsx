import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CAPAS, LIMITES, perfilSchema, type CapaId, type UsuarioPrivado } from '@hp/shared';
import { api, camposDeErro, chaves, mensagemDeErro, useEu } from '../api';
import { Avatar, Campo, Faixa, Girando, useArquivoImagem, useAviso } from '../ui';

export default function EditarPerfil() {
  const { data: eu } = useEu();
  if (!eu) return null;
  return <Formulario eu={eu} />;
}

/** Escolha de capa: o mesmo estado de chip, com a miniatura redonda. */
export function EscolhaCapa({ valor, mudar, tres }: { valor: CapaId; mudar: (c: CapaId) => void; tres?: boolean }) {
  return (
    <div className={`capas${tres ? ' tres' : ''}`} role="group" aria-label="Capas">
      {CAPAS.map((c) => (
        <button type="button" key={c.id} className="capa-op" aria-pressed={valor === c.id} onClick={() => mudar(c.id)}>
          <img src={`/capas/${c.id}.webp`} alt="" /><span>{c.nome}</span>
        </button>
      ))}
    </div>
  );
}

function Formulario({ eu }: { eu: UsuarioPrivado }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const avisar = useAviso();
  const [f, setF] = useState({ nome: eu.nome, email: eu.email, bio: eu.bio, link: eu.link, capa: eu.capa as CapaId });
  const [foto, setFoto] = useArquivoImagem();
  const [erros, setErros] = useState<Record<string, string | undefined>>({});
  const [geral, setGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const s = (k: keyof typeof f) => (x: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: x.target.value }); setErros({ ...erros, [k]: undefined }); };
  const inv = (k: string) => ({ 'aria-invalid': !!erros[k], 'aria-describedby': erros[k] ? `e${k[0]}-msg` : undefined });

  const salvar = async (ev: FormEvent) => {
    ev.preventDefault();
    const r = perfilSchema.safeParse(f);
    if (!r.success) {
      const e: Record<string, string> = {};
      for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
      return setErros(e);
    }
    setEnviando(true); setGeral(null);
    try {
      let u = await api<UsuarioPrivado>('/usuarios/eu', { method: 'PATCH', json: r.data });
      if (foto) {
        const fd = new FormData(); fd.append('foto', foto.arquivo);
        u = await api<UsuarioPrivado>('/usuarios/eu/foto', { method: 'PUT', body: fd });
      }
      qc.setQueryData(chaves.eu, u);
      qc.invalidateQueries({ queryKey: chaves.usuario(u.id) });
      avisar('Perfil atualizado');
      navigate('/perfil');
    } catch (err) {
      const c = camposDeErro(err);
      if (Object.keys(c).length) setErros(c); else setGeral(mensagemDeErro(err));
      setEnviando(false);
    }
  };

  const excluirConta = async () => {
    setErroSenha(null);
    try {
      await api('/usuarios/eu', { method: 'DELETE', json: { senha } });
      qc.clear();
      qc.setQueryData(chaves.eu, null);
      navigate('/');
      avisar('Sua conta foi excluída');
    } catch (err) {
      setErroSenha(camposDeErro(err).senha ?? mensagemDeErro(err));
    }
  };

  const capa = CAPAS.find((c) => c.id === f.capa)!;
  return (
    <form onSubmit={salvar} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Faixa
        alta
        capa={capa}
        alt={`Capa escolhida: ${capa.nome}`}
        quem={<Avatar url={foto?.url ?? eu.fotoUrl} nome={f.nome || eu.nome} tamanho={112} />}
        titulo="Editar perfil"
        acoes={
          <>
            <label className="btn sec" htmlFor="ef" style={{ cursor: 'pointer' }}>Trocar foto</label>
            <input id="ef" className="sr" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(x) => { const a = x.target.files?.[0]; if (a) setFoto(a); }} />
          </>
        }
      />
      {geral && <p className="erro-box" role="alert">{geral}</p>}
      <div className="edit-grid">
        <section className="cartao pedra" aria-labelledby="capa-t">
          <h2 id="capa-t" className="t-nome">Capa</h2>
          <EscolhaCapa valor={f.capa} mudar={(c) => setF({ ...f, capa: c })} />
        </section>
        <section className="cartao pedra" aria-labelledby="dados-t">
          <h2 id="dados-t" className="t-nome">Sobre você</h2>
          <Campo id="en" rotulo="Nome" erro={erros.nome}><input id="en" className="inp" autoComplete="nickname" maxLength={LIMITES.nome} value={f.nome} onChange={s('nome')} {...inv('nome')} /></Campo>
          <Campo id="eb" rotulo="Bio" erro={erros.bio} extra={<span className="cont">{f.bio.length}/{LIMITES.bio}</span>}>
            <textarea id="eb" className="inp" rows={2} maxLength={LIMITES.bio} value={f.bio} onChange={s('bio')} {...inv('bio')} />
          </Campo>
          <Campo id="el" rotulo="Link" erro={erros.link}>
            <input id="el" className="inp" type="url" inputMode="url" autoComplete="url" maxLength={LIMITES.link} placeholder="instagram.com/seu.perfil" value={f.link} onChange={s('link')} {...inv('link')} />
          </Campo>
          <Campo id="ee" rotulo="E-mail" erro={erros.email}><input id="ee" className="inp" type="email" autoComplete="email" maxLength={254} value={f.email} onChange={s('email')} {...inv('email')} /></Campo>
        </section>
      </div>
      <div className="rodape-form">
        <Link className="btn sec" to="/perfil">Descartar</Link>
        <button className="btn" type="submit" disabled={enviando} aria-busy={enviando}>{enviando ? <><Girando />Salvando…</> : 'Salvar alterações'}</button>
      </div>
      <section className="perigo-card pedra" aria-labelledby="perigo-t">
        <div className="txt">
          <h2 id="perigo-t" className="t-nome">Excluir conta</h2>
          <p>Apaga seu perfil e {eu.publicacoes === 1 ? 'sua publicação' : `suas ${eu.publicacoes} publicações`}. Não dá para desfazer.</p>
        </div>
        {excluir ? (
          <div className="conf">
            <Campo id="xs" rotulo="Digite sua senha para confirmar" erro={erroSenha ?? undefined}>
              <input id="xs" className="inp" type="password" autoComplete="current-password" autoFocus value={senha} aria-invalid={!!erroSenha} onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (senha) excluirConta(); } }} />
            </Campo>
            <button type="button" className="btn sec" onClick={() => { setExcluir(false); setSenha(''); setErroSenha(null); }}>Cancelar</button>
            <button type="button" className="btn perigo" disabled={!senha} onClick={excluirConta}>Excluir de vez</button>
          </div>
        ) : (
          <button type="button" className="btn perigo" onClick={() => setExcluir(true)}>Excluir minha conta…</button>
        )}
      </section>
    </form>
  );
}
