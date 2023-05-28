CREATE DATABASE HollowPage;
USE HollowPage;
SELECT * FROM sys.syslanguages;
SET NAMES 'utf8mb4';
SELECT @@lc_time_names;
SET lc_time_names = 'pt_BR';
DROP DATABASE HollowPage;

CREATE TABLE tipoUsuario (
	idTipoUsuario INT PRIMARY KEY AUTO_INCREMENT,
    tipoUsuario VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE fundoPerfil (
	idFundoPerfil INT PRIMARY KEY AUTO_INCREMENT,
    nomeFundoPerfil VARCHAR(50) NOT NULL,
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
	idSalvo INT AUTO_INCREMENT,
    dtSalvo DATETIME NOT NULL,
    fkPostagem INT,
    fkUsuario INT,
		CONSTRAINT pkSalvo PRIMARY KEY (idSalvo, fkPostagem, fkUsuario),
        CONSTRAINT salvoFkPostagem FOREIGN KEY (fkPostagem) REFERENCES postagem(idPostagem),
        CONSTRAINT salvoFkUsuario FOREIGN KEY (fkUsuario) REFERENCES usuario(idUsuario)
);

DROP TABLE salvo;
SELECT * FROM salvo;

INSERT INTO usuario (nome, email, senha, dtNasc) VALUES
	('Tiago', 'ti@gmail.com', '12345', '2005-09-23');
    
INSERT INTO fundoPerfil (nomeFundoPerfil, fundoSrc) VALUES
	('Cidade das Lágrimas', 'bg-profile1.png'),
	('Lago Azul', 'bg-profile2.png'),
	('Poder das Almas', 'bg-profile3.png'),
	('O Cavaleiro', 'bg-profile4.png'),
	('O Vazio', 'bg-profile5.png'),
	('Pico de Cristal', 'bg-profile6.png');
    
UPDATE usuario SET fotoPerfilSrc = 'b8beaab357aa1d0a43b78a6e7a07a39e795fd7e8d1835fd46ace4e8172103d509b06e243c30840913ab285ef1ca14384aba63c55b987985f0f3035805f41726b.png' WHERE idUsuario = 1;
    
UPDATE usuario SET fkFundoPerfil = 2 WHERE idUsuario = 1;

SELECT * FROM postagem
	ORDER BY RAND()
		LIMIT 10;
        
SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        fundoPerfil.fundoSrc,
        fundoPerfil.nomeFundoPerfil
            FROM postagem
                JOIN usuario ON idUsuario = fkUsuario
                JOIN fundoPerfil ON idFundoPerfil = fkFundoPerfil
                    WHERE idUsuario = 1;
                    
    SELECT nome,
            email,
            DATE_FORMAT(dtNasc, '%Y-%m-%d') AS dtNasc,
            fotoPerfilSrc,
            genero,
            tel,
            fundoSrc,
            nomeFundoPerfil
                FROM usuario
                    JOIN fundoPerfil ON idFundoPerfil = fkFundoPerfil
                        WHERE idUsuario = 1;
    
SELECT usuario.*,
        postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y'),
        fundoPerfil.fundoSrc,
        fundoPerfil.nomeFundoPerfil
            FROM usuario
                JOIN postagem ON idUsuario = fkUsuario
                JOIN fundoPerfil ON idFundoPerfil = fkFundoPerfil
                    ORDER BY dtPostagem DESC;
                    
SELECT *,
        postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        fundoPerfil.fundoSrc,
        fundoPerfil.nomeFundoPerfil
            FROM usuario
                LEFT JOIN postagem ON idUsuario = fkUsuario
                JOIN fundoPerfil ON idFundoPerfil = fkFundoPerfil
                    WHERE idUsuario = 2
                        ORDER BY dtPostagem DESC;

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

SELECT usuario.*,
        postagem.*,
        fundoPerfil.*
            FROM usuario
                JOIN postagem ON idUsuario = fkUsuario
                JOIN fundoPerfil ON idFundoPerfil = fkFundoPerfil
                    ORDER BY dtPostagem DESC;
                    
SELECT postagem.idPostagem,
            postagem.titulo,
            postagem.descricao,
            postagem.postSrc,
            DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
            postagem.fkUsuario
				FROM postagem
					JOIN usuario ON idUsuario = fkUsuario
						ORDER BY dtPostagem;

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