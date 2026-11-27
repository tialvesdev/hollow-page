/* Contas e publicações de exemplo para o site no ar: 10 pessoas, 50 publicações e salvos.
   Só usa arte oficial da Team Cherry (artes promocionais, retratos de personagens, esboços e aquarelas
   do Ari Gibson), tirada da Hollow Knight Wiki e do kit de imprensa. Nenhuma arte de fã entra aqui.

   A senha das contas vem de SEED_SENHA, que fica no .env.producao.local e nunca no repositório.
   Rodar (de propósito, contra a produção):
     PERMITIR_PRODUCAO=1 SEED_SENHA=... npm run db:seed:producao   (com as variáveis de .env.producao.local)
   Com --forcar, apaga e recria só estas contas. */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './index.js';
import { config } from '../config.js';
import { semear, type Pessoa, type Publicacao } from './semear.js';

const senha = process.env.SEED_SENHA ?? '';
if (senha.length < 12) throw new Error('Defina SEED_SENHA (12 caracteres ou mais) para as contas de exemplo.');
if (config.NEON_BRANCH === 'production' && config.STORAGE !== 's3') throw new Error('Na produção as imagens vão para o bucket: faltam as variáveis AWS_* da produção.');

const OFICIAL = 'Arte oficial de Hollow Knight · Team Cherry.';
const SILKSONG = 'Arte oficial de Hollow Knight: Silksong · Team Cherry.';
const ARI = 'Do caderno de Ari Gibson · Team Cherry.';

const PESSOAS: Pessoa[] = [
  { k: 'marina', nome: 'Marina Lopes', capa: 'pico-de-cristal', foto: 'avatar-hornet', bio: 'Guardo aqui os retratos oficiais que mais gosto. Hornet em primeiro lugar.', link: '' },
  { k: 'joao', nome: 'João Rocha', capa: 'cidade-das-lagrimas', foto: 'avatar-cornifer', bio: 'Esboços, aquarelas e páginas de caderno da Team Cherry.', link: '' },
  { k: 'bia', nome: 'Bia Kawano', capa: 'poder-das-almas', foto: 'avatar-lace', bio: 'Contando os dias em Pharloom. Tudo de Silksong vem parar aqui.', link: '' },
  { k: 'rafa', nome: 'Rafa Teixeira', capa: 'o-vazio', foto: 'avatar-falso-cavaleiro', bio: 'Chefes de Hallownest, do Falso Cavaleiro às Senhoras Louva-a-deus.', link: '' },
  { k: 'lu', nome: 'Luísa Campos', capa: 'lago-azul', foto: 'avatar-cavaleiro', bio: 'Cenas promocionais em tamanho grande, para usar de papel de parede.', link: '' },
  { k: 'dani', nome: 'Dani Freitas', capa: 'o-cavaleiro', foto: 'avatar-zote', bio: 'Quem você encontra pelo caminho: mapeadores, ferreiros e Zote.', link: '' },
  { k: 'pedro', nome: 'Pedro Alencar', capa: 'lago-azul', foto: 'avatar-quirrel', bio: 'Mapas e cenários. Me perco em Hallownest até hoje.', link: '' },
  { k: 'gabi', nome: 'Gabi Souza', capa: 'o-vazio', foto: 'avatar-cloth', bio: 'Vazio, receptáculos e tudo que é meio triste.', link: '' },
  { k: 'imprensa', nome: 'Acervo Hallownest', capa: 'o-cavaleiro', bio: 'Imagens do kit de imprensa da Team Cherry.', link: 'https://www.hollowknight.com' },
  // só salva, não publica
  { k: 'teo', nome: 'Téo Martins', capa: 'pico-de-cristal', bio: 'Venho olhar e salvar.', link: '' },
];

const POSTS: Publicacao[] = [
  ['caderno-silksong', 'joao', 'Caderno de Pharloom', `Uma página inteira de esboços a lápis dos primeiros estudos de Silksong. ${ARI}`, ['Hornet', 'Personagens'], '2026-10-01T09:20'],
  ['senhoras-louva-a-deus', 'rafa', 'Senhoras Louva-a-deus', `As três irmãs da Vila dos Louva-a-deus, de lança em pé. ${OFICIAL}`, ['Personagens'], '2026-10-01T21:05'],
  ['hornet', 'marina', 'Hornet', `A protetora de Hallownest com a agulha e o fio. ${OFICIAL}`, ['Hornet', 'Personagens'], '2026-10-02T13:40'],
  ['mapa-de-hallownest', 'pedro', 'Mapa de Hallownest', `O reino inteiro numa folha só, com cada área marcada. ${OFICIAL}`, ['Cenário'], '2026-10-03T10:15'],
  ['luz-azul', 'lu', 'Luz azul', `O Cavaleiro entre plantas que brilham no escuro. ${OFICIAL}`, ['Cavaleiro', 'Cenário'], '2026-10-04T19:30'],
  ['zote', 'dani', 'Zote, o Poderoso', `Ele mesmo, de ferrão nas costas e cara de poucos amigos. ${OFICIAL}`, ['Personagens', 'Fofo'], '2026-10-05T16:45'],
  ['receptaculo-partido', 'gabi', 'Receptáculo Partido', `Um receptáculo tomado pela infecção laranja. ${OFICIAL}`, ['Vazio', 'Personagens'], '2026-10-06T22:10'],
  ['falso-cavaleiro', 'rafa', 'Falso Cavaleiro', `A armadura enorme e a maça, logo no começo da jornada. ${OFICIAL}`, ['Personagens'], '2026-10-07T11:00'],
  ['fogo-em-pharloom', 'bia', 'Fogo em Pharloom', `Hornet atravessando as chamas. ${SILKSONG}`, ['Hornet', 'Cenário'], '2026-10-08T18:25'],
  ['cloth-aquarela', 'joao', 'Cloth em aquarela', `Cloth no meio de uma página cheia de cor. ${ARI}`, ['Personagens', 'Fofo'], '2026-10-09T14:50'],
  ['o-cavaleiro', 'marina', 'O Cavaleiro', `De frente, com a capa fechada. ${OFICIAL}`, ['Cavaleiro', 'Fofo'], '2026-10-10T09:05'],
  ['cornifer', 'dani', 'Cornifer', `O mapeador cantarolando enquanto desenha. ${OFICIAL}`, ['Personagens', 'Fofo'], '2026-10-11T20:40'],
  ['redemoinho', 'lu', 'Redemoinho', `O Cavaleiro no meio de um giro de poeira e almas. ${OFICIAL}`, ['Cavaleiro', 'Vazio'], '2026-10-12T15:15'],
  ['mestre-das-almas', 'rafa', 'Mestre das Almas', `O líder do Santuário das Almas, cercado de esferas de luz. ${OFICIAL}`, ['Personagens'], '2026-10-13T12:30'],
  ['lace', 'bia', 'Lace', `A espadachim que cruza o caminho de Hornet. ${SILKSONG}`, ['Personagens'], '2026-10-14T17:55'],
  ['quirrel', 'dani', 'Quirrel', `O viajante de máscara de concha, sempre de passagem. ${OFICIAL}`, ['Personagens'], '2026-10-15T10:20'],
  ['aquarelas-emolduradas', 'joao', 'Aquarelas emolduradas', `Duas aquarelas do Cavaleiro lado a lado, já nas molduras. ${ARI}`, ['Cavaleiro', 'Vazio'], '2026-10-16T21:35'],
  ['coracao-do-vazio', 'pedro', 'Coração do Vazio', `O Cavaleiro de ferrão erguido, numa clareira cinzenta. ${OFICIAL}`, ['Cavaleiro', 'Vazio'], '2026-10-17T13:10'],
  ['hornet-silksong', 'bia', 'Hornet, de Silksong', `Capa vermelha e o fio rodando em volta. ${SILKSONG}`, ['Hornet'], '2026-10-18T19:00'],
  ['mawlek', 'rafa', 'Mawlek Taciturno', `A criatura que vive escondida na Encruzilhada Esquecida. ${OFICIAL}`, ['Personagens'], '2026-10-19T08:45'],
  ['cavaleiro-godmaster', 'lu', 'Godmaster', `O Cavaleiro com a capa em chamas escuras. ${OFICIAL}`, ['Cavaleiro', 'Vazio'], '2026-10-20T16:25'],
  ['caderno-myla', 'joao', 'Myla no caderno', `Myla e algumas cavernas desenhadas a nanquim. ${ARI}`, ['Personagens', 'Fofo'], '2026-10-21T11:40'],
  ['garmond-e-zaza', 'bia', 'Garmond e Zaza', `A dupla de cavaleiros, um carregando o outro. ${SILKSONG}`, ['Personagens', 'Fofo'], '2026-10-22T20:15'],
  ['ferreiro', 'dani', 'Ferreiro de Ferrões', `Martelo na mão e a barba que cobre a cara toda. ${OFICIAL}`, ['Personagens'], '2026-10-23T14:05'],
  ['entre-raizes', 'pedro', 'Entre as raízes', `O Cavaleiro parado no alto de uma pedra. ${OFICIAL}`, ['Cavaleiro', 'Cenário'], '2026-10-24T10:50'],
  ['hornet-em-guarda', 'marina', 'Hornet em guarda', `Agulha apontada e o fio no ar. ${OFICIAL}`, ['Hornet'], '2026-10-25T18:35'],
  ['guardas-da-cidade', 'rafa', 'Guardas da Cidade', `Os insetos que patrulham a Cidade das Lágrimas. ${OFICIAL}`, ['Personagens'], '2026-10-26T12:20'],
  ['shakra', 'bia', 'Shakra', `A cartógrafa de Pharloom, no meio de um salto. ${SILKSONG}`, ['Personagens'], '2026-10-27T21:00'],
  ['tiso-aquarela', 'joao', 'Tiso e o Cavaleiro', `Duas aquarelas em tons de azul. ${ARI}`, ['Personagens', 'Cavaleiro'], '2026-10-28T09:30'],
  ['na-luz', 'lu', 'Na luz', `O Cavaleiro caindo devagar num facho de luz. ${OFICIAL}`, ['Cavaleiro'], '2026-10-29T17:10'],
  ['cloth', 'gabi', 'Cloth', `A guerreira de capuz de pano que sonha com uma batalha gloriosa. ${OFICIAL}`, ['Personagens'], '2026-10-30T13:45'],
  ['cacadora', 'bia', 'A Caçadora', `Chifres brancos e um manto que vai até o chão. ${SILKSONG}`, ['Personagens'], '2026-10-31T19:20'],
  ['cavaleiro-vigilante', 'rafa', 'Cavaleiro Vigilante', `Um dos guardas da torre de Lurien, com a espada atravessada. ${OFICIAL}`, ['Personagens'], '2026-11-01T11:55'],
  ['estudo-tiso', 'joao', 'Estudo do Tiso', `Ficha do personagem com anotações sobre a concha, a capa, os óculos e a bolsa. ${ARI}`, ['Personagens'], '2026-11-02T15:25'],
  ['mestre-do-ferrao', 'dani', 'Mestre do Ferrão', `Um dos mestres que ensinam as artes do ferrão. ${OFICIAL}`, ['Personagens'], '2026-11-03T20:30'],
  ['sombra-gigante', 'lu', 'Sombra gigante', `O Cavaleiro pequeno diante de um vulto enorme. ${OFICIAL}`, ['Cavaleiro', 'Cenário'], '2026-11-04T10:40'],
  ['criada-da-capela', 'bia', 'Criada da capela', `Capuz rasgado e um cajado em espiral. ${SILKSONG}`, ['Personagens'], '2026-11-05T16:00'],
  ['moldura-vermelha', 'gabi', 'Moldura vermelha', `Duas aquarelas claras numa moldura vermelha. ${ARI}`, ['Cavaleiro', 'Vazio'], '2026-11-06T22:15'],
  ['defensor-do-esterco', 'rafa', 'Defensor do Esterco', `Ogrim e sua bola de esterco. ${OFICIAL}`, ['Personagens', 'Fofo'], '2026-11-07T12:50'],
  ['panteao-dourado', 'pedro', 'Panteão dourado', `O Cavaleiro numa arena de luz dourada. ${OFICIAL}`, ['Cavaleiro', 'Cenário'], '2026-11-08T18:05'],
  ['filha-da-forja', 'bia', 'Filha da Forja', `Uma das ferreiras de Pharloom, de capacete de sino. ${SILKSONG}`, ['Personagens'], '2026-11-09T09:15'],
  ['lanceiro-lagosta', 'joao', 'Lanceiro lagosta', `Nanquim sobre papel branco, com um inimigo enorme e o Cavaleiro embaixo. ${ARI}`, ['Personagens'], '2026-11-10T14:35'],
  ['cavaleiro-em-acao', 'marina', 'Pronto para a luta', `O Cavaleiro com o ferrão para trás. ${OFICIAL}`, ['Cavaleiro'], '2026-11-11T19:45'],
  ['phantom', 'bia', 'Phantom', `Uma figura de agulha longa e silhueta escura. ${SILKSONG}`, ['Personagens'], '2026-11-12T11:25'],
  ['caderno-cidade', 'joao', 'Esboço da cidade', `Ruas, pontes e torres ainda a lápis. ${ARI}`, ['Cenário'], '2026-11-13T16:40'],
  ['hornet-vermelho', 'marina', 'Silhueta em vermelho', `Só os olhos de Hornet acesos no escuro. ${SILKSONG}`, ['Hornet'], '2026-11-14T21:20'],
  ['oficial-caverna-azul', 'imprensa', 'Caverna azul', `${OFICIAL}`, ['Cavaleiro', 'Cenário'], '2026-11-18T10:00'],
  ['oficial-falso-cavaleiro', 'imprensa', 'Sobre o Falso Cavaleiro', `${OFICIAL}`, ['Cavaleiro', 'Personagens'], '2026-11-20T10:00'],
  ['oficial-ferrao', 'imprensa', 'Ferrão em punho', `${OFICIAL}`, ['Cavaleiro', 'Vazio'], '2026-11-22T10:00'],
  ['oficial-encruzilhada', 'imprensa', 'Encruzilhada Esquecida', `${OFICIAL}`, ['Cenário', 'Cavaleiro'], '2026-11-24T10:00'],
];

// algumas muito salvas, outras nunca: dá variedade às estatísticas e ao "Mais de"
const SALVOS_POR_POST = POSTS.map((_, i) => (i * 5 + 3) % 10);

const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../seed/producao');
await semear({ pessoas: PESSOAS, posts: POSTS, salvosPorPost: SALVOS_POR_POST, senha, dominio: 'exemplo.test', pasta, prefixo: 'acervo', forcar: process.argv.includes('--forcar') });
await pool.end();
