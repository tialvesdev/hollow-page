import sharp from 'sharp';
import { ErroHttp } from './http.js';

/** Reencoda para WebP: remove metadados (como GPS), limita o tamanho e devolve as dimensões. */
export async function prepararImagem(buf: Buffer, tipo: 'post' | 'avatar') {
  try {
    const base = sharp(buf, { limitInputPixels: 40_000_000 }).rotate();
    const img =
      tipo === 'avatar'
        ? base.resize(400, 400, { fit: 'cover' })
        : base.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true });
    const { data, info } = await img.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    return { dados: data, largura: info.width, altura: info.height };
  } catch {
    throw new ErroHttp(400, 'Não foi possível ler essa imagem. Use um arquivo JPG, PNG, WebP ou GIF.');
  }
}
