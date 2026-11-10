import { pgTable, uuid, varchar, text, date, integer, timestamp, smallserial, smallint, primaryKey } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 80 }).notNull(),
  email: varchar('email', { length: 254 }).notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  nascimento: date('nascimento').notNull(),
  genero: varchar('genero', { length: 1 }).notNull().default(''),
  telefone: varchar('telefone', { length: 20 }).notNull().default(''),
  fotoChave: text('foto_chave'),
  capa: varchar('capa', { length: 40 }).notNull().default('o-cavaleiro'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  autorId: uuid('autor_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  titulo: varchar('titulo', { length: 100 }).notNull(),
  descricao: varchar('descricao', { length: 300 }).notNull().default(''),
  imagemChave: text('imagem_chave').notNull(),
  largura: integer('largura').notNull(),
  altura: integer('altura').notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
});

export const tags = pgTable('tags', {
  id: smallserial('id').primaryKey(),
  nome: varchar('nome', { length: 40 }).notNull().unique(),
});

export const postTags = pgTable(
  'post_tags',
  {
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    tagId: smallint('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })],
);

export const salvos = pgTable(
  'salvos',
  {
    usuarioId: uuid('usuario_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.postId] })],
);
