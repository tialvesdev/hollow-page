import { z } from 'zod';

const env = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string().url().default('postgresql://hp:hp@localhost:5432/hollowpage'),
    // conexão direta (sem o pooler do Neon), usada só nas migrações; se faltar, usa DATABASE_URL
    DATABASE_URL_UNPOOLED: z.string().url().optional(),
    DATABASE_SSL: z.enum(['true', 'false']).default('false'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa de pelo menos 32 caracteres').default('troque-este-segredo-em-producao-0123456789'),
    STORAGE: z.enum(['local', 's3']).optional(),
    UPLOAD_DIR: z.string().default('uploads'),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().default('auto'),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_URL: z.string().optional(),
    // variáveis que o Neon Object Storage injeta (neon deploy / env pull); usadas quando S3_* não vierem
    AWS_ENDPOINT_URL_S3: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    WEB_DIST: z.string().optional(),
    // nome da branch do Neon (o `neon env pull` grava no .env.local)
    NEON_BRANCH: z.string().optional(),
    // só para rodar uma migração em produção a partir do computador, de propósito
    PERMITIR_PRODUCAO: z.enum(['1']).optional(),
    // no desenvolvimento: endereço público do bucket de produção, para mostrar as imagens que vieram de lá
    IMAGENS_PRODUCAO_URL: z.string().url().optional(),
  })
  .parse(process.env);

/* Neon Object Storage: o bucket "hollow-page" (declarado no neon.ts) é público para leitura,
   e cada objeto fica em <AWS_ENDPOINT_URL_S3>/<bucket>/<chave>. Em testes, nunca usa o bucket. */
const neon = env.NODE_ENV !== 'test' && !!env.AWS_ENDPOINT_URL_S3;
const S3_ENDPOINT = env.S3_ENDPOINT ?? (neon ? env.AWS_ENDPOINT_URL_S3 : undefined);
const S3_BUCKET = env.S3_BUCKET ?? (neon ? 'hollow-page' : undefined);
const resolvido = {
  ...env,
  STORAGE: env.STORAGE ?? (neon ? 's3' : 'local'),
  S3_ENDPOINT,
  S3_BUCKET,
  S3_REGION: env.S3_REGION !== 'auto' ? env.S3_REGION : (env.AWS_REGION ?? 'auto'),
  S3_ACCESS_KEY_ID: env.S3_ACCESS_KEY_ID ?? env.AWS_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: env.S3_SECRET_ACCESS_KEY ?? env.AWS_SECRET_ACCESS_KEY,
  S3_PUBLIC_URL: env.S3_PUBLIC_URL ?? (S3_ENDPOINT && S3_BUCKET && neon ? `${S3_ENDPOINT.replace(/\/$/, '')}/${S3_BUCKET}` : undefined),
} as const;

/* Trava: rodando no computador, a API não liga na branch de produção (ela aplica migrações ao subir).
   Para isso existe a branch "desenvolvimento"; veja "Bancos" no README. */
if (env.NODE_ENV === 'development' && env.NEON_BRANCH === 'production' && !env.PERMITIR_PRODUCAO) {
  throw new Error(
    'O .env.local aponta para o banco de produção. Use a branch de desenvolvimento (npm run db:local) ' +
      'ou, se for de propósito, rode com PERMITIR_PRODUCAO=1.',
  );
}

if (env.NODE_ENV === 'production' && env.JWT_SECRET.startsWith('troque-este-segredo')) {
  throw new Error('Defina JWT_SECRET em produção.');
}
const r = resolvido;
if (r.STORAGE === 's3' && !(r.S3_BUCKET && r.S3_ACCESS_KEY_ID && r.S3_SECRET_ACCESS_KEY && r.S3_PUBLIC_URL)) {
  throw new Error('STORAGE=s3 exige as credenciais do bucket: as AWS_* do Neon Object Storage ou S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY e S3_PUBLIC_URL.');
}

export const config = resolvido;
export const emProducao = env.NODE_ENV === 'production';
