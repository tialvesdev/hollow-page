/* Onde as imagens ficam: pasta local (desenvolvimento) ou um bucket compatível com S3
   (Cloudflare R2, Supabase Storage, AWS S3) em produção. */
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { config } from './config.js';

export interface Storage {
  salvar(chave: string, dados: Buffer, tipo: string): Promise<void>;
  apagar(chave: string): Promise<void>;
  ler(chave: string): Promise<Buffer>;
  url(chave: string): string;
}

class StorageLocal implements Storage {
  constructor(private pasta: string) {}
  private caminho(chave: string) {
    const p = path.resolve(this.pasta, chave);
    if (!p.startsWith(path.resolve(this.pasta) + path.sep)) throw new Error('chave inválida');
    return p;
  }
  async salvar(chave: string, dados: Buffer) {
    const p = this.caminho(chave);
    await mkdir(path.dirname(p), { recursive: true });
    await writeFile(p, dados);
  }
  async apagar(chave: string) {
    await unlink(this.caminho(chave)).catch(() => undefined);
  }
  ler(chave: string) {
    return readFile(this.caminho(chave));
  }
  url(chave: string) {
    return `/uploads/${chave}`;
  }
}

class StorageS3 implements Storage {
  private s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      region: config.S3_REGION,
      endpoint: config.S3_ENDPOINT,
      forcePathStyle: !!config.S3_ENDPOINT,
      credentials: { accessKeyId: config.S3_ACCESS_KEY_ID!, secretAccessKey: config.S3_SECRET_ACCESS_KEY! },
    });
  }
  async salvar(chave: string, dados: Buffer, tipo: string) {
    await this.s3.send(
      new PutObjectCommand({ Bucket: config.S3_BUCKET, Key: chave, Body: dados, ContentType: tipo, CacheControl: 'public, max-age=31536000, immutable' }),
    );
  }
  async apagar(chave: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: config.S3_BUCKET, Key: chave })).catch(() => undefined);
  }
  async ler(chave: string) {
    const r = await this.s3.send(new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: chave }));
    return Buffer.from(await r.Body!.transformToByteArray());
  }
  url(chave: string) {
    return `${config.S3_PUBLIC_URL!.replace(/\/$/, '')}/${chave}`;
  }
}

export function criarStorage(): Storage {
  return config.STORAGE === 's3' ? new StorageS3() : new StorageLocal(config.UPLOAD_DIR);
}
