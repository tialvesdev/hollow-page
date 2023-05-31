var database = require("../database/config");

function amostras() {
    // console.log("ACESSEI O FEED MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()");
    var instrucao = `
        SELECT * FROM postagem
            ORDER BY RAND()
                LIMIT 15;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function criarFeed() {
    // console.log("ACESSEI O FEED MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()");
    var instrucao = `
    SELECT postagem.idPostagem,
        postagem.titulo,
        postagem.descricao,
        postagem.postSrc,
        DATE_FORMAT(postagem.dtPostagem, '%d de %M de %Y') AS dtPostagem,
        postagem.fkUsuario,
        usuario.nome,
        usuario.fotoPerfilSrc
            FROM postagem
                JOIN usuario ON idUsuario = fkUsuario
                    ORDER BY dtPostagem;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucao
function postar(post) {
    // console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", titulo, descricao, foto, idUsuario);
    
    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    var instrucao = `
        INSERT INTO postagem (postSrc, dtPostagem, dtLastEdit, titulo, descricao, fkUsuario) VALUES 
            ('${post.imagem}', now(), now(), '${post.titulo}', '${post.descricao}', ${post.idUsuario});
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function salvarPost(idPostagem, idUsuario) {
    // console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", titulo, descricao, foto, idUsuario);
    
    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    var instrucao = `
        INSERT INTO salvo (dtSalvo, fkPostagem, fkUsuario) VALUES 
            (now(), ${idPostagem}, ${idUsuario});
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function removerPostSalvo(idPostagem, idUsuario) {
    // console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", titulo, descricao, foto, idUsuario);
    
    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    var instrucao = `
        DELETE FROM salvo WHERE fkPostagem = ${idPostagem} AND fkUsuario = ${idUsuario};
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function montarGrafico(idUsuario, limite_linhas) {

    instrucaoSql = ''

        instrucaoSql = `
            SELECT 
                COUNT(idPostagem) AS nPosts,
                DATE_FORMAT(dtPostagem, '%d/%m/%Y') AS dataPost
                    FROM postagem
                        JOIN usuario ON idUsuario = fkUsuario
                            WHERE idUsuario = ${idUsuario}
                                GROUP BY dataPost
                                    LIMIT ${limite_linhas};
        `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizarGrafico(idUsuario) {

    instrucaoSql = ''

        instrucaoSql = `
            SELECT 
                COUNT(idPostagem) AS nPosts,
                DATE_FORMAT(dtPostagem, '%d/%m/%Y') AS dataPost
                    FROM postagem
                        JOIN usuario ON idUsuario = fkUsuario
                            WHERE idUsuario = ${idUsuario}
                                GROUP BY dataPost
                                    LIMIT 1;
        `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    amostras,
    criarFeed,
    postar,
    salvarPost,
    removerPostSalvo,
    montarGrafico,
    atualizarGrafico
}