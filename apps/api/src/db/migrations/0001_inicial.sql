-- Hollow Page 2.0: esquema inicial
CREATE TABLE usuarios (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        varchar(80)  NOT NULL,
  email       varchar(254) NOT NULL UNIQUE,
  senha_hash  text         NOT NULL,
  nascimento  date         NOT NULL,
  genero      varchar(1)   NOT NULL DEFAULT '',
  telefone    varchar(20)  NOT NULL DEFAULT '',
  foto_chave  text,
  capa        varchar(40)  NOT NULL DEFAULT 'o-cavaleiro',
  criado_em   timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id      uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo        varchar(100) NOT NULL,
  descricao     varchar(300) NOT NULL DEFAULT '',
  imagem_chave  text NOT NULL,
  largura       integer NOT NULL,
  altura        integer NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX posts_criado_idx ON posts (criado_em DESC, id DESC);
CREATE INDEX posts_autor_idx ON posts (autor_id, criado_em DESC);

CREATE TABLE tags (
  id    smallserial PRIMARY KEY,
  nome  varchar(40) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id uuid     NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  smallint NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX post_tags_tag_idx ON post_tags (tag_id);

CREATE TABLE salvos (
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  criado_em  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, post_id)
);
CREATE INDEX salvos_post_idx ON salvos (post_id);

INSERT INTO tags (nome) VALUES
  ('Cavaleiro'), ('Hornet'), ('Vazio'), ('Fofo'), ('Cenário'), ('Trilha Verde'), ('Colmeia'), ('Personagens');
