import { useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { cadastroSchema, entrarSchema, GENEROS, type UsuarioPrivado } from '@hp/shared';
import { api, camposDeErro, chaves, mensagemDeErro, useEu } from '../api';
import { Avatar, Campo, Icone, Moldura, useIr } from '../ui';

type Erros = Record<string, string | undefined>;
const errosDe = (r: { success: true } | { success: false; error: { issues: { path: (string | number)[]; message: string }[] } }) => {
  const e: Erros = {};
  if (!r.success) for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
  return e;
};
/** Mostra só os erros dos campos já tocados (ao sair do campo, ou enquanto digita nos campos de senha). */
const visiveis = (e: Erros, tocados: Record<string, boolean>) => Object.fromEntries(Object.entries(e).filter(([k]) => tocados[k]));

function Voltar() {
  const ir = useIr();
  return (
    <a className="back" href="/" onClick={(e) => { e.preventDefault(); ir('/'); }}>
      <Icone n="back" s={18} />Início
    </a>
  );
}

export function Entrar() {
  const ir = useIr();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const [f, setF] = useState({ email: '', senha: '' });
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [servidor, setServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const todos = errosDe(entrarSchema.safeParse(f));
  const e = visiveis(todos, tocados);

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setTocados({ email: true, senha: true });
    if (Object.keys(todos).length) return;
    setEnviando(true); setServidor(null);
    try {
      const u = await api<UsuarioPrivado>('/auth/entrar', { method: 'POST', json: f });
      qc.setQueryData(chaves.eu, u);
      ir(params.get('volta') ?? '/feed', { replace: true });
    } catch (err) {
      setServidor(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth">
      <Voltar />
      <div className="art" style={{ backgroundImage: 'url(/img/bg-login.webp)' }} role="img" aria-label="Hornet" />
      <div className="side">
        <form onSubmit={enviar} noValidate>
          <div><h1>Olá de novo!</h1><p className="sub">Entre no Hollow Page usando o cadastro que você já criou.</p></div>
          {servidor && <p className="erro-box" role="alert">{servidor}</p>}
          <Campo id="le" rotulo="E-mail" erro={e.email}>
            <input id="le" className="inp" type="email" autoComplete="email" placeholder="fulano@email.com" value={f.email} aria-invalid={!!e.email}
              onChange={(x) => setF({ ...f, email: x.target.value })} onBlur={() => f.email && setTocados({ ...tocados, email: true })} />
          </Campo>
          <Campo id="ls" rotulo="Senha" erro={e.senha}>
            <input id="ls" className="inp" type="password" autoComplete="current-password" value={f.senha} aria-invalid={!!e.senha}
              onChange={(x) => setF({ ...f, senha: x.target.value })} onBlur={() => f.senha && setTocados({ ...tocados, senha: true })} />
          </Campo>
          <p className="alt">Não tem cadastro ainda? <button type="button" onClick={() => ir('/cadastro')}>Cadastre-se aqui</button></p>
          <div className="act"><button className="btn" type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button></div>
        </form>
      </div>
    </div>
  );
}

export function Cadastro() {
  const ir = useIr();
  const qc = useQueryClient();
  const [f, setF] = useState({ nome: '', email: '', senha: '', conf: '', nascimento: '' });
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [servidor, setServidor] = useState<Erros>({});
  const [geral, setGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const todos = errosDe(cadastroSchema.safeParse(f));
  if (f.senha && f.senha.length < 6) todos.senha = `Faltam ${6 - f.senha.length} caracteres (mínimo de 6).`;
  if (f.conf !== f.senha) todos.conf = 'As senhas não são iguais.';
  const e: Erros = { ...visiveis(todos, tocados) };
  for (const [k, v] of Object.entries(servidor)) if (v) e[k] = v;
  const ao = (k: keyof typeof f, aoDigitar = false) => ({
    value: f[k],
    'aria-invalid': !!e[k],
    onChange: (x: React.ChangeEvent<HTMLInputElement>) => {
      setF({ ...f, [k]: x.target.value });
      setServidor({ ...servidor, [k]: undefined });
      if (aoDigitar) setTocados({ ...tocados, [k]: true });
    },
    onBlur: () => f[k] && setTocados({ ...tocados, [k]: true }),
  });

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setTocados({ nome: true, email: true, senha: true, conf: true, nascimento: true });
    if (Object.keys(todos).length) return;
    setEnviando(true); setGeral(null);
    try {
      const u = await api<UsuarioPrivado>('/auth/cadastro', { method: 'POST', json: { nome: f.nome, email: f.email, senha: f.senha, nascimento: f.nascimento } });
      qc.setQueryData(chaves.eu, u);
      ir('/boas-vindas', { replace: true });
    } catch (err) {
      const c = camposDeErro(err);
      if (Object.keys(c).length) setServidor(c); else setGeral(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth rev">
      <Voltar />
      <div className="art" style={{ backgroundImage: 'url(/img/bg-cadastro.webp)' }} role="img" aria-label="O Cavaleiro" />
      <div className="side">
        <form onSubmit={enviar} noValidate>
          <div><h1>Olá pela primeira vez!</h1><p className="sub">Faça seu cadastro no Hollow Page aqui.</p></div>
          {geral && <p className="erro-box" role="alert">{geral}</p>}
          <Campo id="cn" rotulo="Nome" erro={e.nome}><input id="cn" className="inp" autoComplete="name" placeholder="Fulano da Silva" {...ao('nome')} /></Campo>
          <Campo id="ce" rotulo="E-mail" erro={e.email}><input id="ce" className="inp" type="email" autoComplete="email" placeholder="fulano@email.com" {...ao('email')} /></Campo>
          <Campo id="cs" rotulo="Senha" erro={e.senha}><input id="cs" className="inp" type="password" autoComplete="new-password" {...ao('senha', true)} /></Campo>
          <Campo id="cc" rotulo="Confirme sua senha" erro={e.conf}><input id="cc" className="inp" type="password" autoComplete="new-password" {...ao('conf', true)} /></Campo>
          <Campo id="cd" rotulo="Data de nascimento" erro={e.nascimento}><input id="cd" className="inp" type="date" max={new Date().toISOString().slice(0, 10)} {...ao('nascimento')} /></Campo>
          <p className="alt">Já se cadastrou? <button type="button" onClick={() => ir('/entrar')}>Entre por aqui</button></p>
          <div className="act"><button className="btn" type="submit" disabled={enviando}>{enviando ? 'Cadastrando…' : 'Cadastrar'}</button></div>
        </form>
      </div>
    </div>
  );
}

export function BoasVindas() {
  const ir = useIr();
  const qc = useQueryClient();
  const { data: eu, isLoading } = useEu();
  const [etapa, setEtapa] = useState(0);
  const [foto, setFoto] = useState<{ arquivo: File; url: string } | null>(null);
  const [extra, setExtra] = useState({ genero: '', telefone: '' });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  if (isLoading) return null;
  if (!eu) return <Navigate to="/entrar" replace />;

  const confirmar = async (ev: FormEvent) => {
    ev.preventDefault();
    setEnviando(true); setErro(null);
    try {
      let u = await api<UsuarioPrivado>('/usuarios/eu', { method: 'PATCH', json: extra });
      if (foto) {
        const fd = new FormData(); fd.append('foto', foto.arquivo);
        u = await api<UsuarioPrivado>('/usuarios/eu/foto', { method: 'PUT', body: fd });
      }
      qc.setQueryData(chaves.eu, u);
      setEtapa(2);
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="center">
      <Moldura largura={620}>
        <div className="step">
          <div className="dots" role="img" aria-label={`Etapa ${etapa + 1} de 3`}>{[0, 1, 2].map((i) => <i key={i} className={i <= etapa ? 'on' : ''} />)}</div>
          {etapa === 0 && (
            <>
              <h1>Cadastro realizado com sucesso!</h1>
              <p>A partir daqui há alguns campos opcionais para você preencher, como foto de perfil e gênero.</p>
              <img className="ill" src="/img/hornet-grub.webp" alt="" />
              <button className="btn" onClick={() => setEtapa(1)}>Vamos lá</button>
              <button className="lnk muted" onClick={() => setEtapa(2)}>Pular</button>
            </>
          )}
          {etapa === 1 && (
            <form onSubmit={confirmar}>
              {erro && <p className="erro-box" role="alert">{erro}</p>}
              <div className="avatar-pick">
                <Avatar url={foto?.url ?? eu.fotoUrl} tamanho={110} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="grp-t">Foto de perfil</span>
                  <label className="lnk" htmlFor="bf" style={{ alignSelf: 'flex-start' }}>Importar foto</label>
                  <input id="bf" className="sr" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => { const a = e.target.files?.[0]; if (a) setFoto({ arquivo: a, url: URL.createObjectURL(a) }); }} />
                </div>
              </div>
              <Campo id="bg" rotulo="Gênero">
                <select id="bg" className="inp" value={extra.genero} onChange={(e) => setExtra({ ...extra, genero: e.target.value })}>
                  {GENEROS.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </Campo>
              <Campo id="bt" rotulo="Telefone">
                <input id="bt" className="inp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={extra.telefone} onChange={(e) => setExtra({ ...extra, telefone: e.target.value })} />
              </Campo>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Confirmar'}</button>
                <button type="button" className="lnk muted" onClick={() => setEtapa(2)}>Pular</button>
              </div>
            </form>
          )}
          {etapa === 2 && (
            <>
              <h1>Cadastro completo!</h1>
              <img className="ill" src="/img/ok-knight.webp" alt="" />
              <button className="btn" onClick={() => ir('/feed')}>Entrar</button>
              <p style={{ fontSize: 13 }}>Você também pode preencher esses dados depois, em <Link to="/editar-perfil">Editar perfil</Link>.</p>
            </>
          )}
        </div>
      </Moldura>
    </div>
  );
}
