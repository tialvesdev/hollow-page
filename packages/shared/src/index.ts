import { z } from 'zod';

/* ---------- constantes do produto ---------- */

/** Atributos (tags) usados para filtrar o mural. */
export const TAGS = ['Cavaleiro', 'Hornet', 'Vazio', 'Fofo', 'Cenário', 'Trilha Verde', 'Colmeia', 'Personagens'] as const;
export type Tag = (typeof TAGS)[number];

/** Capas de perfil disponíveis (o arquivo fica em /capas/<id>.webp no front). */
export const CAPAS = [
  { id: 'cidade-das-lagrimas', nome: 'Cidade das Lágrimas' },
  { id: 'lago-azul', nome: 'Lago Azul' },
  { id: 'poder-das-almas', nome: 'Poder das Almas' },
  { id: 'o-cavaleiro', nome: 'O Cavaleiro' },
  { id: 'o-vazio', nome: 'O Vazio' },
  { id: 'pico-de-cristal', nome: 'Pico de Cristal' },
] as const;
export type CapaId = (typeof CAPAS)[number]['id'];
export const CAPA_PADRAO: CapaId = 'o-cavaleiro';

export const GENEROS = [
  { id: '', nome: 'Prefiro não informar' },
  { id: 'F', nome: 'Feminino' },
  { id: 'M', nome: 'Masculino' },
  { id: 'N', nome: 'Não binário' },
] as const;

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
  senhaMin: 6,
  senhaMax: 72, // limite do bcrypt
  imagemMB: 8,
} as const;

/* ---------- validação (usada no front e na API) ---------- */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Digite um e-mail válido, como nome@email.com.')
  .max(254);

const dataNascimento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe sua data de nascimento.')
  .refine((v) => {
    const d = new Date(v + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.getTime() < Date.now() && d.getUTCFullYear() > 1900;
  }, 'Informe uma data de nascimento válida.');

export const cadastroSchema = z.object({
  nome: z.string().trim().min(2, 'Digite seu nome.').max(LIMITES.nome),
  email,
  senha: z
    .string()
    .min(LIMITES.senhaMin, `Use pelo menos ${LIMITES.senhaMin} caracteres.`)
    .max(LIMITES.senhaMax, `Use no máximo ${LIMITES.senhaMax} caracteres.`),
  nascimento: dataNascimento,
});
export type CadastroInput = z.infer<typeof cadastroSchema>;

export const entrarSchema = z.object({
  email,
  senha: z.string().min(1, 'Digite sua senha.').max(LIMITES.senhaMax),
});
export type EntrarInput = z.infer<typeof entrarSchema>;

export const perfilSchema = z
  .object({
    nome: z.string().trim().min(2, 'Digite seu nome.').max(LIMITES.nome),
    email,
    nascimento: dataNascimento,
    genero: z.enum(['', 'F', 'M', 'N']),
    telefone: z
      .string()
      .trim()
      .max(20)
      .regex(/^[\d\s()+-]*$/, 'Use só números, espaços, parênteses, + e -.'),
    capa: z.enum(CAPAS.map((c) => c.id) as [CapaId, ...CapaId[]]),
  })
  .partial();
export type PerfilInput = z.infer<typeof perfilSchema>;

export const novoPostSchema = z.object({
  titulo: z.string().trim().min(1, 'Dê um título à publicação.').max(LIMITES.titulo),
  descricao: z.string().trim().max(LIMITES.descricao).default(''),
  tags: z.array(z.enum(TAGS)).max(TAGS.length).default([]),
});
export type NovoPostInput = z.infer<typeof novoPostSchema>;

export const listarPostsSchema = z.object({
  q: z.string().trim().max(100).optional(),
  tags: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').filter(Boolean) : []))
    .pipe(z.array(z.enum(TAGS))),
  cursor: z.string().optional(),
  limite: z.coerce.number().int().min(1).max(60).default(30),
});

/* ---------- formatos devolvidos pela API ---------- */

export interface UsuarioPublico {
  id: string;
  nome: string;
  fotoUrl: string | null;
  capa: CapaId;
  publicacoes: number;
}

export interface UsuarioPrivado extends UsuarioPublico {
  email: string;
  nascimento: string;
  genero: '' | 'F' | 'M' | 'N';
  telefone: string;
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
