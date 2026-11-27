import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CAPAS, cadastroSchema, entrarSchema, LIMITES, perfilSchema, type CapaId, type UsuarioPrivado } from '@hp/shared';
import { api, camposDeErro, chaves, mensagemDeErro, useEu } from '../api';
import { Avatar, Campo, Esq, Girando, Icone, Logo, Olho, useArquivoImagem, useAviso, useIr } from '../ui';
import { EscolhaCapa } from './EditarPerfil';

type Erros = Record<string, string | undefined>;
const errosDe = (r: { success: true } | { success: false; error: { issues: { path: (string | number)[]; message: string }[] } }) => {
  const e: Erros = {};
  if (!r.success) for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
  return e;
};
/** Mostra só os erros dos campos já tocados (ao sair do campo, ou enquanto digita nos campos de senha). */
const visiveis = (e: Erros, tocados: Record<string, boolean>) => Object.fromEntries(Object.entries(e).filter(([k]) => tocados[k]));
const descrito = (id: string, tem: unknown) => (tem ? { 'aria-describedby': `${id}-msg` } : {});

/** Arte oficial do jogo à esquerda, formulário emoldurado à direita sobre o mesmo preto do fundo. */
/** Arte com o ponto focal medido: fx/fy é onde o personagem está na imagem, ar a proporção dela. */
type Foco = { fx: number; fy: number; ar: number };

/** `personagem`: quem aparece no ornamento de cima do painel, como nas lojas do jogo. */
function LayoutAuth({ img, alt, credito, foco, personagem, children }: { img: string; alt: string; credito: string; foco: Foco; personagem: 'stag' | 'salubra'; children: ReactNode }) {
  const ir = useIr();
  return (
    <div className="auth">
      <section className="foto">
        <div className="foco" style={{ '--fx': foco.fx, '--fy': foco.fy, '--ar': foco.ar } as React.CSSProperties}>
          <img src={img} alt={alt} />
        </div>
        <a className="btn sec" href="/" onClick={(e) => { e.preventDefault(); ir('/'); }}><Icone n="voltar" s={18} traco={2} />Voltar ao início</a>
        <div className="cabeca">
          <Logo className="logo-foto" />
          <span className="credito">{credito}</span>
        </div>
      </section>
      <section className={`painel lunar p-${personagem}`}>{children}</section>
    </div>
  );
}

function CampoSenha({ id, mostrar, alternar, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string; mostrar: boolean; alternar: () => void }) {
  return (
    <div className="inp-grp">
      <input id={id} className="inp" type={mostrar ? 'text' : 'password'} {...props} />
      <button type="button" className="olho" onClick={alternar} aria-pressed={mostrar} aria-label={mostrar ? 'Esconder senha' : 'Mostrar senha'} title={mostrar ? 'Esconder senha' : 'Mostrar senha'}>
        <Olho cerrado={mostrar} />
      </button>
    </div>
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
  const [mostrar, setMostrar] = useState(false);
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
    <LayoutAuth personagem="stag" img="/img/entrar.webp" foco={{ fx: 0.37, fy: 0.45, ar: 1800 / 1688 }} alt="O Cavaleiro numa caverna azul, cercado de mariposas que brilham" credito="Arte oficial de Hollow Knight · Team Cherry">
      <form onSubmit={enviar} noValidate>
        <div className="cabeca">
          <h1 className="t-pag">Entrar</h1>
          <p>Para publicar e ver o que você salvou.</p>
        </div>
        {servidor && <p className="erro-box" role="alert">{servidor}</p>}
        <Campo id="le" rotulo="E-mail" erro={e.email}>
          <input id="le" className="inp" type="email" autoComplete="email" maxLength={254} placeholder="nome@email.com" value={f.email} aria-invalid={!!e.email} {...descrito('le', e.email)}
            onChange={(x) => setF({ ...f, email: x.target.value })} onBlur={() => f.email && setTocados({ ...tocados, email: true })} />
        </Campo>
        <Campo id="ls" rotulo="Senha" erro={e.senha}>
          <CampoSenha id="ls" mostrar={mostrar} alternar={() => setMostrar(!mostrar)} autoComplete="current-password" value={f.senha} aria-invalid={!!e.senha} {...descrito('ls', e.senha)}
            onChange={(x) => setF({ ...f, senha: x.target.value })} onBlur={() => f.senha && setTocados({ ...tocados, senha: true })} />
        </Campo>
        <button className="btn cheio" type="submit" disabled={enviando} aria-busy={enviando} style={{ marginTop: 6 }}>{enviando ? <><Girando />Entrando…</> : 'Entrar'}</button>
        <p className="alt">Ainda não tem conta? <a href="/cadastro" onClick={(x) => { x.preventDefault(); ir('/cadastro'); }}>Criar conta</a></p>
      </form>
    </LayoutAuth>
  );
}

export function Cadastro() {
  const ir = useIr();
  const qc = useQueryClient();
  const [f, setF] = useState({ nome: '', email: '', senha: '' });
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [tentou, setTentou] = useState(false);
  const [servidor, setServidor] = useState<Erros>({});
  const [geral, setGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  const todos = errosDe(cadastroSchema.safeParse(f));
  const resto = LIMITES.senhaMin - f.senha.length;
  const faltam = f.senha && resto > 0 ? `Faltam ${resto} ${resto === 1 ? 'caractere' : 'caracteres'} (mínimo de ${LIMITES.senhaMin}).` : null;
  if (faltam) todos.senha = faltam;
  const e: Erros = { ...visiveis(todos, tocados) };
  for (const [k, v] of Object.entries(servidor)) if (v) e[k] = v;
  // enquanto a pessoa digita, "faltam N caracteres" é dica; vira erro só depois de tentar enviar
  const dicaSenha = !tentou && e.senha === faltam ? faltam ?? undefined : undefined;
  const erroSenha = dicaSenha ? undefined : e.senha;
  const IDS = { nome: 'cn', email: 'ce', senha: 'cs' } as const;
  const ao = (k: keyof typeof f, aoDigitar = false) => ({
    value: f[k],
    'aria-invalid': k === 'senha' ? !!erroSenha : !!e[k],
    ...descrito(IDS[k], k === 'senha' ? erroSenha || dicaSenha : k === 'nome' || e[k]),
    onChange: (x: React.ChangeEvent<HTMLInputElement>) => {
      setF({ ...f, [k]: x.target.value });
      setServidor({ ...servidor, [k]: undefined });
      if (aoDigitar) setTocados({ ...tocados, [k]: true });
    },
    onBlur: () => f[k] && setTocados({ ...tocados, [k]: true }),
  });

  const enviar = async (ev: FormEvent) => {
    ev.preventDefault();
    setTentou(true);
    setTocados({ nome: true, email: true, senha: true });
    if (Object.keys(todos).length) return;
    setEnviando(true); setGeral(null);
    try {
      const u = await api<UsuarioPrivado>('/auth/cadastro', { method: 'POST', json: f });
      qc.setQueryData(chaves.eu, u);
      ir('/boas-vindas', { replace: true });
    } catch (err) {
      const c = camposDeErro(err);
      if (Object.keys(c).length) setServidor(c); else setGeral(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  };

  const emailJaExiste = servidor.email?.startsWith('Este e-mail já tem cadastro');
  const erroEmail = emailJaExiste ? (
    <>Esse e-mail já tem cadastro. <a href="/entrar" onClick={(x) => { x.preventDefault(); ir('/entrar'); }}>Entrar com ele</a></>
  ) : e.email;

  return (
    <LayoutAuth personagem="salubra" img="/img/cadastro.webp" foco={{ fx: 0.4, fy: 0.45, ar: 1800 / 1688 }} alt="O Cavaleiro sobre os restos do Falso Cavaleiro, sob a luz que vem de cima" credito="Arte oficial de Hollow Knight · Team Cherry">
      <form onSubmit={enviar} noValidate>
        <div className="cabeca">
          <h1 className="t-pag">Criar conta</h1>
          <p>Para publicar suas artes e guardar as que você gosta.</p>
        </div>
        {geral && <p className="erro-box" role="alert">{geral}</p>}
        <Campo id="cn" rotulo="Nome" erro={e.nome} dica={e.nome ? undefined : 'É assim que você assina as artes. Pode ser um apelido.'}>
          <input id="cn" className="inp" autoComplete="nickname" maxLength={LIMITES.nome} {...ao('nome')} />
        </Campo>
        <Campo id="ce" rotulo="E-mail" erro={erroEmail}><input id="ce" className="inp" type="email" autoComplete="email" maxLength={254} placeholder="nome@email.com" {...ao('email')} /></Campo>
        <Campo id="cs" rotulo="Senha" erro={erroSenha} dica={dicaSenha}>
          <CampoSenha id="cs" mostrar={mostrar} alternar={() => setMostrar(!mostrar)} autoComplete="new-password" {...ao('senha', true)} />
        </Campo>
        <button className="btn cheio" type="submit" disabled={enviando} aria-busy={enviando} style={{ marginTop: 6 }}>{enviando ? <><Girando />Criando conta…</> : 'Criar conta'}</button>
        <p className="alt">Já tem conta? <a href="/entrar" onClick={(x) => { x.preventDefault(); ir('/entrar'); }}>Entrar</a></p>
      </form>
    </LayoutAuth>
  );
}

/**
 * Logo depois do cadastro: uma tela só, toda opcional, para montar o perfil (foto, capa, bio e link).
 * Salvar leva ao perfil pronto; pular leva ao mural.
 */
export function BoasVindas() {
  const ir = useIr();
  const qc = useQueryClient();
  const avisar = useAviso();
  const { data: eu, isLoading } = useEu();
  const [foto, setFoto] = useArquivoImagem();
  const [extra, setExtra] = useState({ bio: '', link: '', capa: '' as CapaId | '' });
  const [erros, setErros] = useState<Erros>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  if (isLoading) return <div className="bv" aria-busy="true" aria-label="Carregando"><Esq w={220} h={34} /><Esq w="min(980px,100%)" h={520} /></div>;
  if (!eu) return <Navigate to="/entrar" replace />;

  const capaId = (extra.capa || eu.capa) as CapaId;
  const capa = CAPAS.find((c) => c.id === capaId) ?? CAPAS[3];

  const salvar = async (ev: FormEvent) => {
    ev.preventDefault();
    const r = perfilSchema.safeParse({ bio: extra.bio, link: extra.link, capa: capaId });
    if (!r.success) return setErros(errosDe(r));
    setEnviando(true); setErro(null);
    try {
      let u = await api<UsuarioPrivado>('/usuarios/eu', { method: 'PATCH', json: r.data });
      if (foto) {
        const fd = new FormData(); fd.append('foto', foto.arquivo);
        u = await api<UsuarioPrivado>('/usuarios/eu/foto', { method: 'PUT', body: fd });
      }
      qc.setQueryData(chaves.eu, u);
      avisar('Perfil salvo');
      ir('/perfil', { replace: true });
    } catch (err) {
      const c = camposDeErro(err);
      if (Object.keys(c).length) setErros(c); else setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bv">
      <Logo className="bv-logo" />
      <form className="lunar largo" onSubmit={salvar} noValidate aria-labelledby="bv-t">
        <div className="cabeca bv-cab">
          <h1 id="bv-t" className="t-pag">Monte seu perfil</h1>
          <p>Nada aqui é obrigatório. Dá para pular e preencher depois, em Editar perfil.</p>
        </div>
        {erro && <p className="erro-box" role="alert">{erro}</p>}
        <div className="bv-grade">
          <div className="col">
            <h2 className="t-nome">Foto e capa</h2>
            <div className="foto-esc">
              {foto ? <Avatar url={foto.url} nome={eu.nome} tamanho={88} /> : <span className="foto-vazia" aria-hidden="true"><Icone n="camera" s={26} traco={1.6} /></span>}
              <label className="btn sec" htmlFor="bf" style={{ cursor: 'pointer' }}>{foto ? 'Trocar foto' : 'Escolher foto'}</label>
              <input id="bf" className="sr" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { const a = e.target.files?.[0]; if (a) setFoto(a); }} />
            </div>
            <fieldset>
              <legend className="rot">Capa</legend>
              <EscolhaCapa valor={capaId} mudar={(c) => setExtra({ ...extra, capa: c })} />
            </fieldset>
          </div>
          <div className="col">
            <h2 className="t-nome">Sobre você</h2>
            <Campo id="bb" rotulo="Bio" erro={erros.bio} extra={<span className="cont">{extra.bio.length}/{LIMITES.bio}</span>}>
              <textarea id="bb" className="inp" rows={3} maxLength={LIMITES.bio} placeholder="O que você desenha, sua área favorita do reino"
                value={extra.bio} onChange={(e) => setExtra({ ...extra, bio: e.target.value })} aria-invalid={!!erros.bio} />
            </Campo>
            <Campo id="bl" rotulo="Link" erro={erros.link} dica={erros.link ? undefined : 'Portfólio ou rede social, para quem quiser ver mais do seu trabalho.'}>
              <input id="bl" className="inp" type="url" inputMode="url" autoComplete="url" maxLength={LIMITES.link} placeholder="instagram.com/seu.perfil"
                value={extra.link} onChange={(e) => { setExtra({ ...extra, link: e.target.value }); setErros({ ...erros, link: undefined }); }} aria-invalid={!!erros.link} />
            </Campo>
          </div>
        </div>
        <div className="fim">
          <Link className="lnk suave" to="/feed">Pular e ir ao mural</Link>
          <button className="btn" type="submit" disabled={enviando} aria-busy={enviando}>{enviando ? <><Girando />Salvando…</> : 'Salvar e ver meu perfil'}</button>
        </div>
      </form>
    </div>
  );
}
