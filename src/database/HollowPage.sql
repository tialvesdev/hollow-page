CREATE DATABASE HollowPage;
USE HollowPage;
DROP DATABASE HollowPage;

CREATE TABLE tipoUsuario (
	idTipoUsuario INT PRIMARY KEY AUTO_INCREMENT,
    tipoUsuario VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE fundoPerfil (
	idFundoPerfil INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    fundoSrc VARCHAR(500) UNIQUE NOT NULL
);

CREATE TABLE atributo (
	idAtributo INT PRIMARY KEY AUTO_INCREMENT,
    atributo VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE usuario (
	idUsuario INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(30) NOT NULL,
    dtNasc DATE NOT NULL,
    genero CHAR(1),
    tel CHAR(15) UNIQUE,
    fotoPerfilSrc VARCHAR(500),
    fkTipoUsuario INT,
    fkFundoPerfil INT,
		CONSTRAINT usuarioFkTipoUsuario FOREIGN KEY (fkTipoUsuario) REFERENCES tipoUsuario(idTipoUsuario),
		CONSTRAINT usuarioFkFundoPerfil FOREIGN KEY (fkFundoPerfil) REFERENCES fundoPerfil(idFundoPerfil)
);

CREATE TABLE postagem (
	idPostagem INT PRIMARY KEY AUTO_INCREMENT,
    postSrc VARCHAR(500) NOT NULL,
    dtPostagem DATE NOT NULL,
    dtLastEdit DATE NOT NULL,
    titulo VARCHAR(100),
    descricao VARCHAR(300),
    fkUsuario INT,
		CONSTRAINT postagemFkUsuario FOREIGN KEY (fkUsuario) REFERENCES usuario(idUsuario)
);

CREATE TABLE filtro (
	fkAtributo INT,
    fkPostagem INT,
		CONSTRAINT pkFiltro PRIMARY KEY (fkAtributo, fkPostagem),
        CONSTRAINT filtroFkAtributo FOREIGN KEY (fkAtributo) REFERENCES atributo(idAtributo),
        CONSTRAINT filtroFkPostagem FOREIGN KEY (fkPostagem) REFERENCES postagem(idPostagem)
);

CREATE TABLE salvo (
	idSalvo INT,
    dtSalvo DATETIME NOT NULL,
    fkPostagem INT,
    fkUsuario INT,
		CONSTRAINT pkSalvo PRIMARY KEY (idSalvo, fkPostagem, fkUsuario),
        CONSTRAINT salvoFkPostagem FOREIGN KEY (fkPostagem) REFERENCES postagem(idPostagem),
        CONSTRAINT salvoFkUsuario FOREIGN KEY (fkUsuario) REFERENCES usuario(idUsuario)
);

INSERT INTO usuario (nome, email, senha, dtNasc) VALUES
	('Tiago', 'ti@gmail.com', '12345', '2005-09-23');
    
INSERT INTO fundoPerfil (nome, fundoSrc) VALUES
	('Cidade das Lágrimas', 'bg-profile1.png'),
	('Lago Azul', 'bg-profile2.png'),
	('Poder das Almas', 'bg-profile3.png'),
	('O Cavaleiro', 'bg-profile4.png'),
	('O Vazio', 'bg-profile5.png'),
	('Pico de Cristal', 'bg-profile6.png');
    
UPDATE usuario SET fotoPerfilSrc = 'b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png' WHERE idUsuario = 1;
    
UPDATE usuario SET fkFundoPerfil = 2 WHERE idUsuario = 1;
    
SELECT * FROM usuario;

SELECT * FROM postagem;

SELECT usuario.*,
        postagem.*,
		fundoPerfil.*
			FROM usuario
				JOIN postagem ON idUsuario = fkUsuario
                JOIN fundoPerfil ON idFundoPerfil = fkFundoPerfil;
                
SELECT * FROM usuario
UNION
SELECT * FROM postagem
	WHERE fkUsuario = 1;

truncate table postagem;

INSERT INTO postagem (postSrc, dtPostagem, dtLastEdit, titulo, descricao, fkUsuario) VALUES
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1),
	('b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png', now(), now(), 'Titulo', 'Desc', 1);