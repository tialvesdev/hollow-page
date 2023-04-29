CREATE DATABASE safelawn;
drop database safelawn;
USE safelawn;

CREATE TABLE clube (
	idClube INT PRIMARY KEY AUTO_INCREMENT,
	nomeClube VARCHAR(45),
	cnpjClube CHAR(14),
    senhaClube VARCHAR(10),
	emailClube VARCHAR(45),
    telefoneClube CHAR(11),
	ufClube CHAR(2)
);

INSERT INTO clube (nomeClube, cnpjClube, senhaClube, emailClube, telefoneClube, ufClube) VALUES
	('Empresa1 ', '12345678901234', 'senha123', 'contato@empresa1.com.br', '21999999999', 'RJ'),
	('Empresa2', '23456789012345', 'senha456', 'contato@empresa2.com.br', '11999999999', 'SP'),
	('Empresa3', '34567890123456', 'senha789', 'contato@empresa3.com.br', '11999999998', 'SP');

CREATE TABLE  tipoUsuario (
	idTipoUsuario INT PRIMARY KEY AUTO_INCREMENT,
	tipoUsuario VARCHAR(45)
);

INSERT INTO tipoUsuario (tipoUsuario) VALUES 
	('Administrador'), 
    ('Funcionario');

CREATE TABLE usuario (
	idUsuario INT AUTO_INCREMENT,
	nomeUsuario VARCHAR(45),
	emailUsuario VARCHAR(45),
	senhaUsuario VARCHAR(20),
	telefoneUsuario CHAR(11),
	fkClube INT, 
    fkTipoUsuario INT,
    FOREIGN KEY (fkClube) REFERENCES clube(idClube),
	PRIMARY KEY (idUsuario, fkClube),
    FOREIGN KEY (fkTipoUsuario) REFERENCES tipoUsuario(idTipoUsuario)
);

INSERT INTO usuario (nomeUsuario, emailUsuario, senhaUsuario, telefoneUsuario, fkClube, fkTipoUsuario) VALUES
	('João Alvares', 'joao.alvares@empresa1.com.br', '123456', '21988888888', 1, 1),
	('Pedro Roberto', 'pedro.roberto@empresa2.com.br', '123456', '11977777777', 2, 2),
	('Felipe Silve', 'felipe.silva@empresa3.com.br', '123456', '11966666666', 3, 2);

CREATE TABLE endereco (
	idEndereco INT PRIMARY KEY AUTO_INCREMENT,
    cep CHAR(8),
	logradouro VARCHAR(45),
	numero INT,
	complemento VARCHAR(45)
);

INSERT INTO endereco (cep, logradouro, numero, complemento) VALUES
	('01234567', 'Rua A', 123, ''),
	('89012345', 'Avenida B', 456, 'Sala 1'),
	('65432109', 'Rua C', 789, 'Bloco D');

CREATE TABLE tipoGrama (
idTipoGrama INT PRIMARY KEY AUTO_INCREMENT,
TipoGrama VARCHAR(15)
);

INSERT INTO tipoGrama (tipoGrama) VALUES
	('Bermuda'),
	('Zoysia'),
    ('rizomatosas');

CREATE TABLE medida (
idMedida INT PRIMARY KEY AUTO_INCREMENT,
UnidadeMedida VARCHAR(45),
sigla VARCHAR(45)
);

INSERT INTO medida (UnidadeMedida, sigla) VALUES
	('Porcentagem', '%'), 
    ('Milímetro', 'mm'),
	('Grão por metro cúbico', 'g/m3'), 
	('Pascal', 'Pa');
    
CREATE TABLE alturaGramado (
idAlturaGramado INT PRIMARY KEY AUTO_INCREMENT,
altura INT,
fkMedida INT,
FOREIGN KEY (fkmedida) REFERENCES medida(idMedida)
); 

INSERT INTO alturaGramado (altura, fkMedida) VALUES
	(10, 2),
    (15, 2),
    (20, 2);

CREATE TABLE fornecedorGramado (
idFornecedorGramado INT PRIMARY KEY AUTO_INCREMENT,
nomeFornecedor VARCHAR(45),
telefoneFornecedor VARCHAR(45),
email VARCHAR(45)
);

INSERT INTO fornecedorGramado (nomeFornecedor, telefoneFornecedor, email) VALUES
	('Fornecedor A', '11987654321', 'contato@fornecedora.com.br'),
	('Fornecedor B', '21987654321', 'contato@fornecedorb.com.br'),
	('Fornecedor C', '31987654321', 'contato@fornecedorc.com.br');

CREATE TABLE modeloGramado (
	idmodeloGramado INT PRIMARY KEY AUTO_INCREMENT,
    minUmidade INT,
    maxUmidade INT,
    fkFornecedorGramado INT,
    fkTipoGrama INT,
    fkAlturaGramado INT,
    FOREIGN KEY (fkFornecedorGramado) REFERENCES fornecedorGramado(idFornecedorGramado),
    FOREIGN KEY (fkTipoGrama) REFERENCES tipoGrama(idtipoGrama),
    FOREIGN KEY (fkalturaGramado) REFERENCES alturaGramado(idAlturaGramado)
);
  
 INSERT INTO modeloGramado (minUmidade, maxUmidade, fkFornecedorGramado, fkTipoGrama, fkalturaGramado) VALUES
	(20, 55, 1, 1, 1),
    (25, 60, 2, 2, 2),
    (30, 65, 3, 3, 3);

CREATE TABLE estadio (
	idEstadio INT PRIMARY KEY AUTO_INCREMENT,
	nomeEstadio VARCHAR(40),
    cnpjEstadio VARCHAR (14),
	fkClube INT,
	fkEndereco INT,
    fkModeloGramado INT, 
    FOREIGN KEY (fkClube) REFERENCES clube(idClube),
    FOREIGN KEY (fkEndereco) REFERENCES endereco(idEndereco),
    FOREIGN KEY (fkModeloGramado) REFERENCES modeloGramado(idmodeloGramado)
);

INSERT INTO estadio (nomeEstadio, cnpjEstadio, fkClube, fkEndereco, fkModeloGramado) VALUES 
	('Estadio1', '12345678901234', 1, 1, 1),
	('Estadio2', '23456789012345', 2, 2, 2),
	('Estadio3', '34567890123456', 3, 3, 3);

CREATE TABLE SetorEstadio (
	idSetor INT PRIMARY KEY AUTO_INCREMENT,
    nomeSetor VARCHAR(45),
    fkEstadio INT,
    FOREIGN KEY (fkEstadio) REFERENCES estadio(idEstadio)
);

INSERT INTO SetorEstadio (nomeSetor, fkEstadio) VALUES
	('Norte-Leste', 1),
    ('Norte-Oeste', 1),
    ('Sul-Leste', 1),
    ('Sul-Oeste', 1),
    ('Norte-Leste', 2),
    ('Norte-Oeste', 2),
    ('Sul-Leste', 2),
    ('Sul-Oeste', 2),
    ('Norte-Leste', 3),
    ('Norte-Oeste', 3),
    ('Sul-Leste', 3),
    ('Sul-Oeste', 3);

CREATE TABLE statusSensor (
idStatusSensor INT PRIMARY KEY AUTO_INCREMENT,
statusSendor VARCHAR(45)
);

INSERT INTO statusSensor (statusSendor) VALUES
	('Ativo'),
    ('Inativo'),
    ('Manutenção');

CREATE TABLE modeloSensor (
idModeloSensor INT PRIMARY KEY AUTO_INCREMENT,
modeloSensor VARCHAR(45)
);

INSERT INTO modeloSensor (modeloSensor) VALUES 
	('DHT11'),
    ('DHT12'),
    ('DHT13');

CREATE TABLE Sensor (
	idSensor INT PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(45),
    fkSetor INT, 
    fkstatusSensor INT,
    fkmodeloSensor INT,
     FOREIGN KEY (fkSetor) REFERENCES SetorEstadio(idSetor),
    FOREIGN KEY (fkstatusSensor) REFERENCES statusSensor(idStatusSensor),
    FOREIGN KEY (fkmodeloSensor) REFERENCES modeloSensor(idModeloSensor)
);

INSERT INTO Sensor (descricao, fkSetor, fkstatusSensor, fkmodeloSensor) VALUES
	('Sensor 1', 1, 1, 1),
    ('Sensor 2', 2, 2, 1),
    ('Sensor 3', 3, 3, 2),
    ('Sensor 1', 5, 1, 2),
    ('Sensor 2', 6, 2, 2),
    ('Sensor 3', 7, 3, 3),
    ('Sensor 1', 9, 1, 1),
    ('Sensor 1', 10, 2, 2),
    ('Sensor 1', 11, 3, 3);

CREATE TABLE DadosSensor (
	idCaptura INT AUTO_INCREMENT,
    dtCaptura DATE,
    valorCaptura FLOAT,
    fkSensor INT,
    fkMedida INT,
	FOREIGN KEY (fkSensor) REFERENCES Sensor(idSensor),
    PRIMARY KEY (idCaptura, fkSensor),
    FOREIGN KEY (fkMedida) REFERENCES medida(idMedida)
);

INSERT INTO DadosSensor (dtCaptura, valorCaptura, fkSensor, fkMedida) VALUES
	('2023-04-21', 20, 1, 1),
    ('2023-04-21', null, 2, 1),
    ('2023-04-21', null, 3, 1),
    ('2023-04-22', 30, 4, 1),
    ('2023-04-22', null, 5, 1),
    ('2023-04-22', null, 6, 1),
    ('2023-04-21', 65, 7, 1),
    ('2023-04-21', null, 8, 1),
    ('2023-04-21', null, 9, 1);

-- todos
SELECT * FROM clube;
SELECT * FROM tipoUsuario;
SELECT * FROM usuario;
SELECT * FROM endereco;
SELECT * FROM tipoGrama;
SELECT * FROM medida;
SELECT * FROM alturagramado;
SELECT * FROM fornecedorGramado;
SELECT * FROM modeloGramado;
SELECT * FROM estadio;
SELECT * FROM SetorEstadio;
SELECT * FROM statusSensor;
SELECT * FROM modeloSensor;
SELECT * FROM Sensor;
SELECT * FROM dadosSensor;

-- cadastro 
SELECT * FROM usuario JOIN clube ON fkClube=idClube JOIN tipoUsuario ON fkTipoUsuario=idTipousuario;
SELECT * FROM clube JOIN usuario ON fkClube=idClube WHERE fkTipoUsuario=1;
SELECT * FROM clube JOIN usuario ON fkclube=idClube WHERE idClube=1;
SELECT * FROM endereco JOIN estadio ON fkEndereco=idEndereco; 

 -- gramado
SELECT * FROM alturagramado JOIN medida ON fkMedida=idMedida;
SELECT * FROM fornecedorGramado JOIN modeloGramado ON fkFornecedorGramado=IdFornecedorGramado JOIN estadio ON fkModeloGramado=idModelogramado WHERE idestadio=2;
SELECT * FROM tipoGrama JOIN modeloGramado ON fkTipoGrama=idtipoGrama JOIN fornecedorGramado ON fkFornecedorGramado=idFornecedorGramado;
SELECT * FROM modeloGramado JOIN fornecedorGramado ON fkFornecedorGramado=idFornecedorGramado 
JOIN alturagramado ON fkAlturaGramado=idAlturaGramado JOIN medida ON fkMedida=idMedida;

-- sensor
SELECT * FROM modeloSensor JOIN Sensor ON fkmodeloSensor=idmodeloSensor JOIN DadosSensor ON fkSensor=idSensor;

-- estadio e setor
SELECT * FROM estadio JOIN SetorEstadio ON fkEstadio=idEstadio WHERE idEstadio=2;

-- estadio, setor e sensor
SELECT * FROM estadio JOIN SetorEstadio ON fkEstadio=idEstadio JOIN Sensor ON fkSetor=idSetor WHERE idEstadio=2;

-- estadio
SELECT * FROM estadio JOIN clube ON fkClube=IdClube JOIN endereco ON fkEndereco=idEndereco
JOIN modeloGramado ON fkModeloGramado=idModeloGramado;