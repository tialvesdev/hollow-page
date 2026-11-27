import { z } from 'zod';

/* ---------- constantes do produto ---------- */

/** Atributos (tags) usados para filtrar o mural. */
export const TAGS = ['Cavaleiro', 'Hornet', 'Vazio', 'Fofo', 'Cenário', 'Trilha Verde', 'Colmeia', 'Personagens'] as const;
export type Tag = (typeof TAGS)[number];

/** Capas de perfil disponíveis (o arquivo fica em /capas/<id>.webp no front). */
/* fx/fy: onde está o assunto da imagem (fração da largura e da altura), medido em cada arte.
   ar: proporção (largura / altura). O front usa isso para enquadrar o assunto, não o centro da foto. */
export const CAPAS = [
  { id: 'cidade-das-lagrimas', nome: 'Cidade das Lágrimas', fx: 0.48, fy: 0.55, ar: 2888 / 718 },
  { id: 'lago-azul', nome: 'Lago Azul', fx: 0.62, fy: 0.62, ar: 2882 / 742 },
  { id: 'poder-das-almas', nome: 'Poder das Almas', fx: 0.55, fy: 0.45, ar: 2898 / 742 },
  { id: 'o-cavaleiro', nome: 'O Cavaleiro', fx: 0.51, fy: 0.5, ar: 2870 / 742 },
  { id: 'o-vazio', nome: 'O Vazio', fx: 0.48, fy: 0.55, ar: 2894 / 742 },
  { id: 'pico-de-cristal', nome: 'Pico de Cristal', fx: 0.55, fy: 0.68, ar: 2874 / 742 },
] as const;
export type Capa = (typeof CAPAS)[number];
export type CapaId = (typeof CAPAS)[number]['id'];
export const CAPA_PADRAO: CapaId = 'o-cavaleiro';

/** Cores de destaque escolhidas pela pessoa (todas com contraste ≥ 4,5:1 sobre #040308). */
export const ACENTOS = [
  { nome: 'Lifeblood', cor: '#69E2EE' },
  { nome: 'Grimm', cor: '#EF6069' },
  { nome: 'Grimm escuro', cor: '#D4506C' },
  { nome: 'Crystal', cor: '#E9AFE9' },
  { nome: 'Dreams', cor: '#BF78CE' },
  { nome: 'Godmaster', cor: '#DDC890' },
  { nome: 'Branco', cor: '#FFFFFF' },
] as const;

export const LIMITES = {
  nome: 80,
  titulo: 100,
  descricao: 300,
  senhaMin: 8,
  senhaMaxBytes: 72, // o bcrypt ignora o que passa de 72 bytes; acentos e emojis ocupam mais de 1 byte
  imagemMB: 8,
  bio: 160,
  link: 200,
  busca: 100,
} as const;

/* ---------- limpeza de texto (antes de validar) ---------- */

/*
 * Caracteres que não deveriam chegar ao banco: controles invisíveis (menos tab e quebra de linha,
 * tratados à parte), espaços de largura zero e os marcadores que invertem a direção do texto,
 * usados para disfarçar nomes e links.
 */
// eslint-disable-next-line no-control-regex
const INVISIVEIS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

/** Texto de uma linha: sem invisíveis, quebras viram espaço, espaços repetidos viram um. */
export const limparLinha = (v: string) => v.normalize('NFC').replace(INVISIVEIS, '').replace(/\s+/g, ' ').trim();

/** Texto com parágrafos: mantém quebras de linha (no máximo uma linha em branco seguida). */
export const limparTexto = (v: string) =>
  v.normalize('NFC').replace(/\r\n?/g, '\n').replace(INVISIVEIS, '').replace(/[^\S\n]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

const linha = () => z.string().transform(limparLinha);
const texto = () => z.string().transform(limparTexto);

/** Ids do banco (gen_random_uuid). Qualquer outra coisa nem chega a consultar. */
export const ehUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

/* ---------- campos ---------- */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Esse e-mail é longo demais.')
  .email('Digite um e-mail válido, como nome@email.com.');

/* nome de quem assina as artes: letras de qualquer idioma, números, espaço e . ' ’ - _ */
const nome = linha().pipe(
  z
    .string()
    .min(2, 'Digite seu nome, com pelo menos 2 letras.')
    .max(LIMITES.nome, `Use no máximo ${LIMITES.nome} caracteres.`)
    .regex(/^[\p{L}\p{M}\p{N} .'’_-]+$/u, "Use letras, números, espaço e . ' - _ no nome.")
    .refine((v) => /\p{L}/u.test(v), 'O nome precisa ter pelo menos uma letra.'),
);

const bytes = (v: string) => new TextEncoder().encode(v).length;
const senhaNova = z
  .string()
  .min(LIMITES.senhaMin, `Use pelo menos ${LIMITES.senhaMin} caracteres.`)
  .refine((v) => bytes(v) <= LIMITES.senhaMaxBytes, 'Senha longa demais. Use até 72 letras sem acento.')
  .refine((v) => /\S/.test(v), 'A senha não pode ser só espaços.');

/** Link de portfólio ou rede social. Aceita sem "https://" e completa sozinho; vazio apaga. */
const link = linha()
  .pipe(z.string().max(LIMITES.link, `Use no máximo ${LIMITES.link} caracteres.`))
  .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      // só http(s), com domínio de verdade e sem usuário/senha embutidos no endereço
      return /^https?:$/.test(u.protocol) && /\.[a-z]{2,}$/i.test(u.hostname) && !u.username && !u.password;
    } catch {
      return false;
    }
  }, 'Esse link não parece um endereço. Exemplo: instagram.com/seu.perfil');

/* ---------- formulários (usados no front e na API) ---------- */

/*
 * O cadastro pede só o que o mural usa: um nome para assinar as artes, e-mail e senha para entrar.
 * Foto, capa, bio e link são opcionais e ficam para depois.
 */
export const cadastroSchema = z.object({ nome, email, senha: senhaNova });
export type CadastroInput = z.infer<typeof cadastroSchema>;

export const entrarSchema = z.object({
  email,
  senha: z.string().min(1, 'Digite sua senha.').max(200, 'Senha longa demais.'),
});
export type EntrarInput = z.infer<typeof entrarSchema>;

export const perfilSchema = z
  .object({
    nome,
    email,
    bio: linha().pipe(z.string().max(LIMITES.bio, `Use no máximo ${LIMITES.bio} caracteres.`)),
    link,
    capa: z.enum(CAPAS.map((c) => c.id) as [CapaId, ...CapaId[]]),
  })
  .partial();
export type PerfilInput = z.infer<typeof perfilSchema>;

export const novoPostSchema = z.object({
  titulo: linha().pipe(z.string().min(1, 'Dê um título à publicação.').max(LIMITES.titulo, `Use no máximo ${LIMITES.titulo} caracteres.`)),
  descricao: texto().pipe(z.string().max(LIMITES.descricao, `Use no máximo ${LIMITES.descricao} caracteres.`)).default(''),
  tags: z.array(z.enum(TAGS)).max(TAGS.length).default([]),
});
export type NovoPostInput = z.infer<typeof novoPostSchema>;

export const listarPostsSchema = z.object({
  q: linha().pipe(z.string().max(LIMITES.busca, 'Busca longa demais.')).optional(),
  tags: z
    .string()
    .max(300)
    .optional()
    .transform((v) => (v ? v.split(',').filter(Boolean) : []))
    .pipe(z.array(z.enum(TAGS, { message: 'Atributo desconhecido.' })).max(TAGS.length)),
  cursor: z.string().max(200, 'Página inválida.').optional(),
  limite: z.coerce.number().int().min(1).max(60).default(30),
});

/* ---------- formatos devolvidos pela API ---------- */

export interface UsuarioPublico {
  id: string;
  nome: string;
  fotoUrl: string | null;
  capa: CapaId;
  publicacoes: number;
  /** Frase curta que aparece no perfil. */
  bio: string;
  /** Portfólio ou rede social, já com https://. */
  link: string;
}

export interface UsuarioPrivado extends UsuarioPublico {
  email: string;
}

export interface Post {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string;
  largura: number;
  altura: number;
  tags: Tag[];
  criadoEm: string;
  salvos: number;
  salvoPorMim: boolean;
  autor: { id: string; nome: string; fotoUrl: string | null };
}

export interface PaginaPosts {
  itens: Post[];
  proximo: string | null;
}

export interface Estatisticas {
  totalSalvos: number;
  porDia: { dia: string; publicacoes: number }[];
  maisSalvo: Post | null;
  menosSalvo: Post | null;
}

export interface ErroApi {
  erro: string;
  campos?: Record<string, string>;
}
