CREATE DATABASE HollowPage;
USE HollowPage;
SELECT * FROM sys.syslanguages;
SET NAMES 'utf8mb4';
SELECT @@lc_time_names;
SET lc_time_names = 'pt_BR';
DROP DATABASE HollowPage;

show tables;

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
    tel CHAR(11) DEFAULT 'Sem número!',
    fotoPerfilSrc VARCHAR(500) DEFAULT '../assets/img/icon/user-icon.png',
		CONSTRAINT generoUsuario CHECK (genero IN('M', 'F', 'N', 'X')),
		CONSTRAINT fichaFkUsuario FOREIGN KEY (fkUsuario) REFERENCES usuario(idUsuario)
);

desc ficha;

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

desc ficha;
alter table ficha modify column tel CHAR(11) DEFAULT 'Sem número!';
ALTER TABLE ficha DROP KEY tel;

delete from ficha where fkUsuario = 5;

insert into ficha (fkUsuario) values
	(5);

DROP TABLE ficha;

-- BASIC INSERTS
INSERT INTO usuario (nome, email, senha, dtNasc) VALUES
	('Tiago', 'ti@gmail.com', '12345', '2005-09-23');
    
INSERT INTO salvo (dtSalvo, fkPostagem, fkUsuario) VALUES
	(now(), 3, 2);
    
INSERT INTO fundoPerfil (nomeFundoPerfil, fundoSrc) VALUES
	('Cidade das Lágrimas', 'bg-profile1.jpg'),
	('Lago Azul', 'bg-profile2.jpg'),
	('Poder das Almas', 'bg-profile3.jpg'),
	('O Cavaleiro', 'bg-profile4.jpg'),
	('O Vazio', 'bg-profile5.jpg'),
	('Pico de Cristal', 'bg-profile6.jpg');
    
-- SELECTS
SELECT 
	COUNT(idPostagem) AS nPosts,
    DATE_FORMAT(dtPostagem, '%d/%m/%Y') AS dataPost
		FROM postagem
				WHERE fkUsuario = 1
					GROUP BY dataPost;
                    
SELECT * FROM usuario 
	LEFT JOIN ficha ON idUsuario = fkUsuario
		WHERE email = 'ti@gmail.com' AND senha = '12345';
        
        truncate table salvo;
        delete from postagem where fkUsuario = 5;
        truncate table filtro;
        select * from filtro;
        select * from postagem;
    
    
-- ZONA
SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        postagem.fkUsuario,
        usuario.nome,
        usuario.fotoPerfilSrc,
        salvo.fkUsuario
            FROM postagem
                LEFT JOIN salvo ON idPostagem = fkPostagem
                JOIN usuario ON idUsuario = postagem.fkUsuario
					WHERE salvo.fkUsuario = 1 OR salvo.fkUsuario is null
						ORDER BY dtPostagem;
                        
SELECT 
	COUNT(idPostagem) AS postMaisSalvo,
    postagem.postagemSrc AS foto
		FROM postagem
            JOIN salvo ON idPostagem = fkPostagem
            JOIN usuario ON idUsuario = postagem.fkUsuario
				WHERE postagem.fkUsuario = 5
					GROUP BY foto
						ORDER BY postMaisSalvo DESC
							LIMIT 1;
                            
SELECT 
	COUNT(idPostagem) AS vezesSalvo,
    postagem.postagemSrc AS foto
		FROM postagem
            JOIN salvo ON idPostagem = fkPostagem
            JOIN usuario ON idUsuario = postagem.fkUsuario
				WHERE postagem.fkUsuario = 5
					GROUP BY foto
						ORDER BY postMaisSalvo
							LIMIT 1;
                    
SELECT MAX(COUNT(fkPostagem)) FROM salvo
	JOIN postagem ON idPostagem = fkPostagem
		GROUP BY postagem.titulo;

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

SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postagemSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        postagem.fkUsuario,
        usuario.nome,
        ficha.fotoPerfilSrc,
        salvo.fkUsuario
            FROM postagem
                LEFT JOIN salvo ON idPostagem = fkPostagem
                JOIN usuario ON idUsuario = postagem.fkUsuario
                JOIN ficha ON  idUsuario = ficha.fkUsuario
					WHERE salvo.fkUsuario = 6 OR salvo.fkUsuario is null
						ORDER BY dtPostagem;
                        
                        update ficha set fotoPerfilSrc = '../assets/bucket/f83b6c2e0f9f597679b5c5ae5ea01ead4526efd2cea99de3719e97f9a6b076ed35d3aa0d2dd2f092020f796a2ff8fc8769b79cc347b946ce686ee856cfaf3f9d.jpg' where fkUsuario = 7;
SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postagemSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        postagem.fkUsuario as postagemFkUsuario,
        -- usuario.nome,
        -- ficha.fotoPerfilSrc,
        salvo.fkUsuario as salvoFkUsuario
            FROM postagem
                LEFT JOIN salvo ON idPostagem = fkPostagem
                JOIN usuario ON idUsuario = postagem.fkUsuario
                JOIN ficha ON  idUsuario = ficha.fkUsuario
					WHERE salvo.fkUsuario = 5 OR salvo.fkUsuario is null
						ORDER BY dtPostagem;
                        
select * from postagem;
select * from salvo;
                    
SELECT * from salvo;

SELECT nome,
            email,
            DATE_FORMAT(usuario.dtNasc, '%d/%m/%Y') AS dtNasc,
            fotoPerfilSrc,
            genero,
            tel,
            fundoSrc,
            nomeFundoPerfil
                FROM usuario
                    JOIN fundoPerfil ON idFundoPerfil = fkFundoPerfil
                    JOIN ficha ON idUsuario = fkUsuario
                        WHERE idUsuario = 5;
                        
SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postagemSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        postagem.fkUsuario AS postFkUsuario,
        usuario.nome,
        ficha.fotoPerfilSrc
        , salvo.fkUsuario AS salvoFkUsuario
            FROM postagem
                JOIN usuario ON idUsuario = postagem.fkUsuario
                JOIN ficha ON  idUsuario = ficha.fkUsuario
                LEFT JOIN salvo ON idPostagem = salvo.fkPostagem
					WHERE salvo.fkUsuario = 5 OR salvo.fkUsuario is null
						ORDER BY dtPostagem;
                        
SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postagemSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        postagem.fkUsuario AS postFkUsuario,
        usuario.nome,
        ficha.fotoPerfilSrc,
        salvo.fkUsuario AS salvoFkUsuario
            FROM postagem
                JOIN usuario ON idUsuario = postagem.fkUsuario
                JOIN ficha ON  idUsuario = ficha.fkUsuario
                LEFT JOIN salvo ON idPostagem = salvo.fkPostagem
						ORDER BY dtPostagem;
                            
select * from salvo;
select * from postagem;
truncate table salvo;

select * from postagem;

SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postagemSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        postagem.fkUsuario,
        salvo.fkUsuario AS salvoFkUsuario,
        usuario.nome,
        ficha.fotoPerfilSrc
            FROM postagem
                JOIN usuario ON idUsuario = fkUsuario
                JOIN ficha ON idUsuario = ficha.fkUsuario
                LEFT JOIN salvo ON idPostagem = salvo.fkPostagem
                    WHERE salvo.fkUsuario = 6
                        ORDER BY dtSalvo;
                        
SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postagemSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        postagem.fkUsuario AS postFkUsuario,
        usuario.nome,
        ficha.fotoPerfilSrc
            FROM postagem
                JOIN usuario ON idUsuario = postagem.fkUsuario
                JOIN ficha ON  idUsuario = ficha.fkUsuario;
                
SELECT
	fkUsuario
		FROM salvo
			WHERE fkPostagem = 7 AND fkUsuario = 7;
                
                
SELECT 
	idPostagem,
	salvo.fkUsuario
		FROM postagem
			LEFT JOIN salvo ON idPostagem = fkPostagem
				WHERE salvo.fkUsuario = 6;
            
SELECT * FROM postagem;
UNION ALL
SELECT 
	idPostagem,
	titulo,
	salvo.fkUsuario
		FROM postagem
			RIGHT JOIN salvo ON idPostagem = fkPostagem;

select * from salvo;