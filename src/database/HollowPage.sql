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
    
SELECT * FROM usuario;