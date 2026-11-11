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
    STORAGE: z.enum(['local', 's3']).default('local'),
    UPLOAD_DIR: z.string().default('uploads'),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().default('auto'),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_URL: z.string().optional(),
    WEB_DIST: z.string().optional(),
  })
  .parse(process.env);

if (env.NODE_ENV === 'production' && env.JWT_SECRET.startsWith('troque-este-segredo')) {
  throw new Error('Defina JWT_SECRET em produção.');
}
if (env.STORAGE === 's3' && !(env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_PUBLIC_URL)) {
  throw new Error('STORAGE=s3 exige S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY e S3_PUBLIC_URL.');
}

export const config = env;
export const emProducao = env.NODE_ENV === 'production';
