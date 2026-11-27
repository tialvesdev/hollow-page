/* Dados de exemplo para desenvolvimento: 7 pessoas, 24 publicações e salvos variados.
   As fan arts em ./seed são de fãs e as "oficial-*" são do kit de imprensa da Team Cherry: servem só para
   testar localmente; não use em produção sem crédito e permissão.

   Não apaga nada que já esteja no banco: só acrescenta as contas de exemplo (e-mails @exemplo.test).
   Com --forcar, apaga e recria apenas essas contas de exemplo (e o que elas publicaram).
   Todas as contas usam a senha SENHA_EXEMPLO, abaixo. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './index.js';
import { migrar } from './migrate.js';
import { hashSenha } from '../auth.js';
import { prepararImagem } from '../imagens.js';
import { criarStorage } from '../storage.js';

const SENHA_EXEMPLO = 'hallownest';
const DOMINIO = 'exemplo.test';
const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../seed');

type Pessoa = { k: string; nome: string; capa: string; bio: string; link: string; foto?: string };
const PESSOAS: Pessoa[] = [
  { k: 'fulano', nome: 'Fulano da Silva', capa: 'o-vazio', foto: 'avatar-cavaleiro', bio: 'Desenho o reino desde 2017, quase sempre a Trilha Verde.', link: 'https://instagram.com/fulano.desenha' },
  { k: 'lira', nome: 'Lira Moraes', capa: 'pico-de-cristal', foto: 'avatar-hornet', bio: 'Hornet é minha personagem favorita. Aquarela e nanquim.', link: 'https://www.artstation.com/liramoraes' },
  { k: 'beto', nome: 'Beto Nunes', capa: 'cidade-das-lagrimas', bio: 'Ilustrações em estilo de carta de baralho.', link: '' },
  { k: 'ana', nome: 'Ana Duarte', capa: 'lago-azul', foto: 'avatar-banco', bio: 'Coisas fofas de Hallownest. Encomendas abertas.', link: 'https://ko-fi.com/anaduarte' },
  { k: 'caio', nome: 'Caio Reis', capa: 'poder-das-almas', foto: 'avatar-grimm', bio: '', link: '' },
  { k: 'acervo', nome: 'Acervo Oficial', capa: 'o-cavaleiro', bio: 'Artes oficiais da Team Cherry, para testar o mural com imagens grandes.', link: 'https://www.hollowknight.com' },
  // só salva, não publica: serve para ver o perfil sem artes
  { k: 'nina', nome: 'Nina Prado', capa: 'lago-azul', bio: 'Só venho olhar e salvar as artes dos outros.', link: '' },
];

const POSTS: [string, string, string, string, string[], string][] = [
  ['p02', 'fulano', 'Musgo e silêncio', 'O Cavaleiro descansando no meio da Trilha Verde, cercado de folhas.', ['Cavaleiro', 'Trilha Verde'], '2026-10-02T10:12'],
  ['p09', 'fulano', 'Ruínas cobertas', 'Dois viajantes entre colunas antigas tomadas pela vegetação.', ['Cenário', 'Trilha Verde'], '2026-10-02T19:40'],
  ['p18', 'fulano', 'Fim de tarde', 'O Cavaleiro olhando o horizonte em tons de rosa e laranja.', ['Cavaleiro', 'Cenário'], '2026-10-04T21:03'],
  ['p01', 'fulano', 'Raízes do Vazio', 'O pequeno vaso e as sombras que vêm de baixo.', ['Cavaleiro', 'Vazio'], '2026-10-06T15:30'],
  ['p14', 'fulano', 'Pote de mel', 'A Colmeia inteira guardada num pote de vidro.', ['Colmeia', 'Fofo'], '2026-10-06T16:02'],
  ['p21', 'fulano', 'Azul profundo', 'Traço livre em azuis e verdes, com borboletas.', ['Cavaleiro'], '2026-10-09T09:47'],
  ['p00', 'lira', 'Asas douradas', 'Um rei pálido em ouro, emoldurado como uma carta antiga.', ['Personagens'], '2026-09-28T11:00'],
  ['p06', 'lira', 'Amigos de papel', 'Hornet e o Cavaleiro desenhando juntos.', ['Hornet', 'Cavaleiro', 'Fofo'], '2026-09-29T14:20'],
  ['p19', 'lira', 'Lanterna', 'O Cavaleiro e Hornet sob a luz de uma lanterna.', ['Hornet', 'Cavaleiro'], '2026-10-01T20:15'],
  ['p03', 'beto', 'Carta do vaso', 'Ilustração em losango, com detalhes em dourado.', ['Personagens'], '2026-09-30T08:10'],
  ['p10', 'beto', 'Fones no ninho', 'Pausa para ouvir a trilha sonora.', ['Fofo', 'Cavaleiro'], '2026-10-03T22:45'],
  ['p16', 'beto', 'Guardião', 'Criaturas enormes dormindo sobre ossos.', ['Personagens'], '2026-10-05T13:33'],
  ['p04', 'ana', 'Pote vermelho', 'Uma criatura curiosa guardada num frasco.', ['Fofo'], '2026-10-01T09:00'],
  ['p07', 'ana', 'A sombra', 'Silhueta com olhos brancos, em círculo.', ['Vazio'], '2026-10-03T10:30'],
  ['p15', 'ana', 'Hora de dormir', 'O Cavaleiro e sua sombra cochilando.', ['Cavaleiro', 'Vazio', 'Fofo'], '2026-10-07T23:58'],
  ['p17', 'ana', 'Banquete', 'Uma mesa cheia de convidados de Hallownest.', ['Cenário', 'Personagens'], '2026-10-08T18:10'],
  ['p08', 'caio', 'Esboço no escuro', 'Linhas claras sobre fundo preto.', ['Cavaleiro'], '2026-09-27T16:00'],
  ['p11', 'caio', 'Entre as folhas', 'Só os chifres aparecem no meio do verde.', ['Trilha Verde', 'Cavaleiro'], '2026-10-02T12:12'],
  ['p13', 'caio', 'Eu e minha sombra', 'O Cavaleiro com a lanterna e a sombra ao lado.', ['Cavaleiro', 'Vazio'], '2026-10-06T11:11'],
  ['p20', 'caio', 'Capela em cinza', 'Um cenário em preto e branco, cheio de detalhes.', ['Cenário'], '2026-10-08T07:45'],
  ['oficial-caverna-azul', 'acervo', 'Caverna azul', 'Arte oficial de Hollow Knight · Team Cherry.', ['Cavaleiro', 'Cenário'], '2026-11-10T10:00'],
  ['oficial-falso-cavaleiro', 'acervo', 'Sobre o Falso Cavaleiro', 'Arte oficial de Hollow Knight · Team Cherry.', ['Cavaleiro', 'Personagens'], '2026-11-12T10:00'],
  ['oficial-ferrao', 'acervo', 'Ferrão em punho', 'Arte oficial de Hollow Knight · Team Cherry.', ['Cavaleiro', 'Vazio'], '2026-11-14T10:00'],
  ['oficial-encruzilhada', 'acervo', 'Encruzilhada Esquecida', 'Cena oficial de Hollow Knight · Team Cherry.', ['Cenário', 'Cavaleiro'], '2026-11-16T10:00'],
];

// quantas pessoas salvam cada arte: algumas muito salvas, outras nunca (para estatísticas e o carrossel)
const SALVOS_POR_POST = [6, 2, 5, 0, 3, 1, 6, 4, 2, 0, 3, 1, 5, 2, 4, 0, 1, 2, 3, 0, 6, 5, 4, 3];

await migrar(pool);
const emails = PESSOAS.map((p) => `${p.k}@${DOMINIO}`);
const { rows: existentes } = await pool.query<{ id: string }>('SELECT id FROM usuarios WHERE email = ANY($1::text[])', [emails]);
if (existentes.length && !process.argv.includes('--forcar')) {
  console.log('As contas de exemplo já existem. Rode com --forcar para apagá-las e recriar (o resto do banco não é tocado).');
  process.exit(0);
}
if (existentes.length) await pool.query('DELETE FROM usuarios WHERE email = ANY($1::text[])', [emails]); // posts e salvos saem em cascata

const s = criarStorage();
const senha = await hashSenha(SENHA_EXEMPLO);
const ids: Record<string, string> = {};
for (const p of PESSOAS) {
  let fotoChave: string | null = null;
  if (p.foto) {
    const img = await prepararImagem(await readFile(path.join(pasta, `${p.foto}.webp`)), 'avatar');
    fotoChave = `avatares/exemplo-${p.k}.webp`;
    await s.salvar(fotoChave, img.dados, 'image/webp');
  }
  const r = await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash, capa, bio, link, foto_chave) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
    [p.nome, `${p.k}@${DOMINIO}`, senha, p.capa, p.bio, p.link, fotoChave],
  );
  ids[p.k] = r.rows[0].id;
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

// salvos: quem salva cada arte varia; ninguém salva a própria
const todos = PESSOAS.map((p) => p.k);
for (const [i, pid] of postIds.entries()) {
  const autor = POSTS[i]![1];
  const outros = todos.filter((k) => k !== autor);
  const n = Math.min(SALVOS_POR_POST[i] ?? 0, outros.length);
  for (let j = 0; j < n; j++) {
    const quem = outros[(i + j * 2) % outros.length]!;
    await pool.query('INSERT INTO salvos (usuario_id, post_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [ids[quem], pid]);
  }
}
console.log(`Exemplos criados: ${PESSOAS.length} pessoas e ${POSTS.length} publicações. Entre com fulano@${DOMINIO} (ou outra conta do arquivo) e a senha que está em src/db/seed.ts.`);
await pool.end();
