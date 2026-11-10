import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CAPAS, GENEROS, perfilSchema, type CapaId, type UsuarioPrivado } from '@hp/shared';
import { api, camposDeErro, chaves, mensagemDeErro, useEu } from '../api';
import { Avatar, Campo, Icone, useAviso } from '../ui';

export default function EditarPerfil() {
  const { data: eu } = useEu();
  if (!eu) return null;
  return <Formulario eu={eu} />;
}

function Formulario({ eu }: { eu: UsuarioPrivado }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const avisar = useAviso();
  const [f, setF] = useState({ nome: eu.nome, email: eu.email, nascimento: eu.nascimento, genero: eu.genero, telefone: eu.telefone, capa: eu.capa as CapaId });
  const [foto, setFoto] = useState<{ arquivo: File; url: string } | null>(null);
  const [erros, setErros] = useState<Record<string, string | undefined>>({});
  const [geral, setGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const s = (k: keyof typeof f) => (x: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setF({ ...f, [k]: x.target.value }); setErros({ ...erros, [k]: undefined }); };

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
    <div className="formpage">
      <form className="edit" onSubmit={salvar} noValidate>
        <div className="hd">
          <button type="button" className="xbtn" aria-label="Voltar ao perfil" onClick={() => navigate('/perfil')}><Icone n="x" /></button>
          <h1>Editar perfil</h1><span />
        </div>
        {geral && <p className="erro-box" role="alert">{geral}</p>}
        <div className="egrid">
          <div className="col">
            <span className="grp-t">Dados pessoais</span>
            <Campo id="en" rotulo="Nome" erro={erros.nome}><input id="en" className="inp" autoComplete="name" value={f.nome} onChange={s('nome')} /></Campo>
            <Campo id="ee" rotulo="E-mail" erro={erros.email}><input id="ee" className="inp" type="email" autoComplete="email" value={f.email} onChange={s('email')} /></Campo>
            <Campo id="ed" rotulo="Data de nascimento" erro={erros.nascimento}><input id="ed" className="inp" type="date" value={f.nascimento} onChange={s('nascimento')} /></Campo>
            <span className="grp-t" style={{ marginTop: 10 }}>Dados opcionais</span>
            <Campo id="eg" rotulo="Gênero"><select id="eg" className="inp" value={f.genero} onChange={s('genero')}>{GENEROS.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}</select></Campo>
            <Campo id="et" rotulo="Telefone" erro={erros.telefone}><input id="et" className="inp" type="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={f.telefone} onChange={s('telefone')} /></Campo>
          </div>
          <div className="col" style={{ alignItems: 'center' }}>
            <Avatar url={foto?.url ?? eu.fotoUrl} tamanho={180} />
            <span className="grp-t">Foto de perfil</span>
            <label className="lnk" htmlFor="ef" style={{ marginTop: -12 }}>Importar foto</label>
            <input id="ef" className="sr" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(x) => { const a = x.target.files?.[0]; if (a) setFoto({ arquivo: a, url: URL.createObjectURL(a) }); }} />
            <div className="capa-pv" style={{ backgroundImage: `url(/capas/${capa.id}.webp)` }} role="img" aria-label={`Prévia da capa: ${capa.nome}`} />
            <span className="grp-t" style={{ alignSelf: 'flex-start', marginBottom: -12 }}>Capa de perfil</span>
            <div className="capas" style={{ width: '100%' }}>
              {CAPAS.map((c) => (
                <button type="button" key={c.id} aria-pressed={f.capa === c.id} aria-label={`Capa ${c.nome}`} onClick={() => setF({ ...f, capa: c.id })}>
                  <img src={`/capas/${c.id}.webp`} alt="" /><span>{c.nome}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn" type="submit" disabled={enviando} style={{ minWidth: 220 }}>{enviando ? 'Salvando…' : 'Salvar alterações'}</button>
        </div>
        <div className="danger-zone">
          {excluir ? (
            <>
              <span>Excluir a conta apaga seu perfil e suas publicações. Para confirmar, digite sua senha.</span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <Campo id="xs" rotulo="Senha atual" erro={erroSenha ?? undefined}>
                  <input id="xs" className="inp" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
                </Campo>
                <button type="button" className="btn sm" onClick={() => { setExcluir(false); setSenha(''); }}>Cancelar</button>
                <button type="button" className="btn sm danger" disabled={!senha} onClick={excluirConta}>Excluir conta</button>
              </div>
            </>
          ) : (
            <>
              <span>Quer sair do Hollow Page de vez?</span>
              <button type="button" className="btn sm danger" onClick={() => setExcluir(true)}>Excluir conta</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
