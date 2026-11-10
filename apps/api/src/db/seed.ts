/* Dados de exemplo para desenvolvimento: 5 pessoas e 20 publicações.
   As artes em ./seed são de fãs e servem só para testar; não use em produção sem crédito e permissão. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './index.js';
import { migrar } from './migrate.js';
import { hashSenha } from '../auth.js';
import { prepararImagem } from '../imagens.js';
import { criarStorage } from '../storage.js';

const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../seed');
const PESSOAS = [
  ['fulano', 'Fulano da Silva', 'o-vazio'],
  ['lira', 'Lira Moraes', 'pico-de-cristal'],
  ['beto', 'Beto Nunes', 'cidade-das-lagrimas'],
  ['ana', 'Ana Duarte', 'lago-azul'],
  ['caio', 'Caio Reis', 'poder-das-almas'],
] as const;
const POSTS: [string, string, string, string, string[], string, number][] = [
  ['p02', 'fulano', 'Musgo e silêncio', 'O Cavaleiro descansando no meio da Trilha Verde, cercado de folhas.', ['Cavaleiro', 'Trilha Verde'], '2023-05-02T10:12', 0],
  ['p09', 'fulano', 'Ruínas cobertas', 'Dois viajantes entre colunas antigas tomadas pela vegetação.', ['Cenário', 'Trilha Verde'], '2023-05-02T19:40', 0],
  ['p18', 'fulano', 'Fim de tarde', 'O Cavaleiro olhando o horizonte em tons de rosa e laranja.', ['Cavaleiro', 'Cenário'], '2023-05-04T21:03', 0],
  ['p01', 'fulano', 'Raízes do Vazio', 'O pequeno vaso e as sombras que vêm de baixo.', ['Cavaleiro', 'Vazio'], '2023-05-06T15:30', 0],
  ['p14', 'fulano', 'Pote de mel', 'A Colmeia inteira guardada num pote de vidro.', ['Colmeia', 'Fofo'], '2023-05-06T16:02', 0],
  ['p21', 'fulano', 'Azul profundo', 'Traço livre em azuis e verdes, com borboletas.', ['Cavaleiro'], '2023-05-09T09:47', 0],
  ['p00', 'lira', 'Asas douradas', 'Um rei pálido em ouro, emoldurado como uma carta antiga.', ['Personagens'], '2023-04-28T11:00', 0],
  ['p06', 'lira', 'Amigos de papel', 'Hornet e o Cavaleiro desenhando juntos.', ['Hornet', 'Cavaleiro', 'Fofo'], '2023-04-29T14:20', 0],
  ['p19', 'lira', 'Lanterna', 'O Cavaleiro e Hornet sob a luz de uma lanterna.', ['Hornet', 'Cavaleiro'], '2023-05-01T20:15', 0],
  ['p03', 'beto', 'Carta do vaso', 'Ilustração em losango, com detalhes em dourado.', ['Personagens'], '2023-04-30T08:10', 0],
  ['p10', 'beto', 'Fones no ninho', 'Pausa para ouvir a trilha sonora.', ['Fofo', 'Cavaleiro'], '2023-05-03T22:45', 0],
  ['p16', 'beto', 'Guardião', 'Criaturas enormes dormindo sobre ossos.', ['Personagens'], '2023-05-05T13:33', 0],
  ['p04', 'ana', 'Pote vermelho', 'Uma criatura curiosa guardada num frasco.', ['Fofo'], '2023-05-01T09:00', 0],
  ['p07', 'ana', 'A sombra', 'Silhueta com olhos brancos, em círculo.', ['Vazio'], '2023-05-03T10:30', 0],
  ['p15', 'ana', 'Hora de dormir', 'O Cavaleiro e sua sombra cochilando.', ['Cavaleiro', 'Vazio', 'Fofo'], '2023-05-07T23:58', 0],
  ['p17', 'ana', 'Banquete', 'Uma mesa cheia de convidados de Hallownest.', ['Cenário', 'Personagens'], '2023-05-08T18:10', 0],
  ['p08', 'caio', 'Esboço no escuro', 'Linhas claras sobre fundo preto.', ['Cavaleiro'], '2023-04-27T16:00', 0],
  ['p11', 'caio', 'Entre as folhas', 'Só os chifres aparecem no meio do verde.', ['Trilha Verde', 'Cavaleiro'], '2023-05-02T12:12', 0],
  ['p13', 'caio', 'Eu e minha sombra', 'O Cavaleiro com a lanterna e a sombra ao lado.', ['Cavaleiro', 'Vazio'], '2023-05-06T11:11', 0],
  ['p20', 'caio', 'Capela em cinza', 'Um cenário em preto e branco, cheio de detalhes.', ['Cenário'], '2023-05-08T07:45', 0],
];

await migrar(pool);
const { rows } = await pool.query('SELECT count(*)::int AS n FROM usuarios');
if (rows[0].n > 0 && !process.argv.includes('--forcar')) {
  console.log('O banco já tem dados. Rode com --forcar para apagar tudo e recriar os exemplos.');
  process.exit(0);
}
await pool.query('TRUNCATE salvos, post_tags, posts, usuarios CASCADE');
const s = criarStorage();
const senha = await hashSenha('123456');
const ids: Record<string, string> = {};
for (const [k, nome, capa] of PESSOAS) {
  const r = await pool.query('INSERT INTO usuarios (nome, email, senha_hash, nascimento, capa) VALUES ($1,$2,$3,$4,$5) RETURNING id', [nome, `${k}@email.com`, senha, '1999-02-03', capa]);
  ids[k] = r.rows[0].id;
}
const postIds: string[] = [];
for (const [arq, autor, titulo, desc, tags, data] of POSTS) {
  const img = await prepararImagem(await readFile(path.join(pasta, `${arq}.webp`)), 'post');
  const chave = `posts/exemplo-${arq}.webp`;
  await s.salvar(chave, img.dados, 'image/webp');
  const r = await pool.query(
    `INSERT INTO posts (autor_id, titulo, descricao, imagem_chave, largura, altura, criado_em) VALUES ($1,$2,$3,$4,$5,$6,$7::timestamp AT TIME ZONE 'America/Sao_Paulo') RETURNING id`,
    [ids[autor], titulo, desc, chave, img.largura, img.altura, data],
  );
  postIds.push(r.rows[0].id);
  await pool.query('INSERT INTO post_tags (post_id, tag_id) SELECT $1, id FROM tags WHERE nome = ANY($2::text[])', [r.rows[0].id, tags]);
}
// alguns salvos para as estatísticas terem o que mostrar
for (const [i, pid] of postIds.entries()) {
  const quem = Object.values(ids).filter((_, j) => (i + j) % 3 === 0);
  for (const u of quem) await pool.query('INSERT INTO salvos (usuario_id, post_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [u, pid]);
}
console.log(`Exemplos criados: ${PESSOAS.length} pessoas e ${POSTS.length} publicações. Entre com fulano@email.com e senha 123456.`);
await pool.end();
