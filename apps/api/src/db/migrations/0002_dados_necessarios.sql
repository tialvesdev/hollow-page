-- O cadastro passa a pedir só o que o mural usa (nome, e-mail e senha).
-- Nascimento, gênero e telefone não eram usados em lugar nenhum: saem do banco (minimização de dados, LGPD).
-- Entram dois campos opcionais para quem desenha: uma bio curta e um link de portfólio ou rede social.
ALTER TABLE usuarios
  DROP COLUMN nascimento,
  DROP COLUMN genero,
  DROP COLUMN telefone,
  ADD COLUMN bio varchar(160) NOT NULL DEFAULT '',
  ADD COLUMN link varchar(200) NOT NULL DEFAULT '';
