var database = require("../database/config")

function listar() {
    var instrucao = `
        SELECT * FROM usuario;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function entrar(email, senha) {
    var instrucao = `
        SELECT * FROM usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    
        
    return database.executar(instrucao);
}

function cadastrar(nome, email, senha, dtNasc) {    
    var instrucao = `
        INSERT INTO usuario (nome, email, senha, dtNasc, fkFundoPerfil) VALUES ('${nome}', '${email}', '${senha}', '${dtNasc}', 1);
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}


function mostrarPerfil(idUsuario) {
    var instrucao = `
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
                        WHERE idUsuario = ${idUsuario};
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function mostrarPerfilPosts(idUsuario) {
    var instrucao = `
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
                        WHERE idUsuario = ${idUsuario}
                            ORDER BY dtPostagem DESC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function editarUsuario(idUsuario, nome, email, dtNasc, fotoPerfil, genero, tel, fotoCapa) {
    var instrucao = `
        UPDATE usuario 
        SET nome = '${nome}',
            email = '${email}',
            dtNasc = '${dtNasc}',
            fotoPerfilSrc = '${fotoPerfil}',
            genero = '${genero}',
            tel = '${tel}',
            fkFundoPerfil = ${fotoCapa}
                WHERE idUsuario = ${idUsuario};
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}


module.exports = {
    listar,
    entrar,
    cadastrar,
    mostrarPerfil,
    mostrarPerfilPosts,
    editarUsuario
};