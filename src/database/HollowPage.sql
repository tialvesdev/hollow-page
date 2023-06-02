CREATE DATABASE HollowPage;
USE HollowPage;
SELECT * FROM sys.syslanguages;
SET NAMES 'utf8mb4';
SELECT @@lc_time_names;
SET lc_time_names = 'pt_BR';
DROP DATABASE HollowPage;

-- CREATES
CREATE TABLE fundoPerfil (
	idFundoPerfil INT PRIMARY KEY AUTO_INCREMENT,
    nomeFundoPerfil VARCHAR(50) NOT NULL,
    fundoSrc VARCHAR(500) UNIQUE NOT NULL
);

CREATE TABLE atributo (
	idAtributo INT PRIMARY KEY AUTO_INCREMENT,
    atributo VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE usuario (
	idUsuario INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(30) NOT NULL,
    dtNasc DATE NOT NULL,
    fkFundoPerfil INT,
		CONSTRAINT usuarioFkFundoPerfil FOREIGN KEY (fkFundoPerfil) REFERENCES fundoPerfil(idFundoPerfil)
);

CREATE TABLE ficha (
	fkUsuario INT PRIMARY KEY,
	genero CHAR(1) DEFAULT 'X',
    tel CHAR(11) UNIQUE,
    fotoPerfilSrc VARCHAR(500) DEFAULT '../assets/img/icon/user-icon.png',
		CONSTRAINT generoUsuario CHECK (genero IN('M', 'F', 'N', 'X')),
		CONSTRAINT fichaFkUsuario FOREIGN KEY (fkUsuario) REFERENCES usuario(idUsuario)
);

CREATE TABLE postagem (
	idPostagem INT PRIMARY KEY AUTO_INCREMENT,
    postagemSrc VARCHAR(500) NOT NULL,
    dtPostagem DATETIME NOT NULL DEFAULT now(),
    titulo VARCHAR(100) DEFAULT 'Sem Título',
    descricao VARCHAR(300) DEFAULT 'Sem Descrição',
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
    dtSalvo DATETIME NOT NULL DEFAULT now(),
    fkPostagem INT,
    fkUsuario INT,
		CONSTRAINT pkSalvo PRIMARY KEY (fkPostagem, fkUsuario),
        CONSTRAINT salvoFkPostagem FOREIGN KEY (fkPostagem) REFERENCES postagem(idPostagem),
        CONSTRAINT salvoFkUsuario FOREIGN KEY (fkUsuario) REFERENCES usuario(idUsuario)
);

-- SELECTS ALL
SELECT * FROM fundoPerfil;
SELECT * FROM atributo;
SELECT * FROM usuario;
SELECT * FROM ficha;
SELECT * FROM postagem;
SELECT * FROM filtro;
SELECT * FROM salvo;

desc usuario;
alter table usuario modify column fotoPerfilSrc varchar(1000);

-- BASIC INSERTS
INSERT INTO usuario (nome, email, senha, dtNasc) VALUES
	('Tiago', 'ti@gmail.com', '12345', '2005-09-23');
    
INSERT INTO fundoPerfil (nomeFundoPerfil, fundoSrc) VALUES
	('Cidade das Lágrimas', 'bg-profile1.jpg'),
	('Lago Azul', 'bg-profile2.jpg'),
	('Poder das Almas', 'bg-profile3.jpg'),
	('O Cavaleiro', 'bg-profile4.jpg'),
	('O Vazio', 'bg-profile5.jpg'),
	('Pico de Cristal', 'bg-profile6.jpg');
    
-- SELECTS DASHBOARD
SELECT 
	COUNT(idPostagem) AS nPosts,
    DATE_FORMAT(dtPostagem, '%d/%m/%Y') AS dataPost
		FROM postagem
				WHERE fkUsuario = 1
					GROUP BY dataPost;
    
    
-- ZONA
UPDATE usuario 
SET fotoPerfilSrc = null 
WHERE idUsuario = 1;

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

DELETE FROM salvo WHERE fkPostagem = 3 AND fkUsuario = 1;

update usuario set fotoPerfilSrc = null where idUsuario = 1;
    
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

SELECT usuario.*,
        postagem.*,
		fundoPerfil.*
			FROM usuario
				JOIN postagem ON idUsuario = fkUsuario
                JOIN fundoPerfil ON idFundoPerfil = fkFundoPerfil;

select * from fundoPerfil;
update fundoPerfil set fundoSrc = 'bg-profile6.jpg' where idFundoPerfil = 6;

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
