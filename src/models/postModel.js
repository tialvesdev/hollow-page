var database = require("../database/config");

function amostras() {
    var instrucao = `
        SELECT * FROM postagem
            ORDER BY RAND()
                LIMIT 15;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function criarFeed(idUsuario) {
    var instrucao = `
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
					-- WHERE salvo.fkUsuario = ${idUsuario} OR salvo.fkUsuario is null
						ORDER BY dtPostagem;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function postar(post) {
    var instrucao = `
        INSERT INTO postagem (postagemSrc, dtPostagem, titulo, descricao, fkUsuario) VALUES 
            ('../assets/bucket/${post.imagem}', now(), '${post.titulo}', '${post.descricao}', ${post.idUsuario});
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function salvarPost(idPostagem, idUsuario) {
    var instrucao = `
        INSERT INTO salvo (dtSalvo, fkPostagem, fkUsuario) VALUES 
            (now(), ${idPostagem}, ${idUsuario});
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function removerPostSalvo(idPostagem, idUsuario) {
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
                        WHERE fkUsuario = ${idUsuario}
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
                        WHERE fkUsuario = ${idUsuario}
                            GROUP BY dataPost
                                LIMIT 1;
        `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function postsSalvos(idUsuario) {
    // console.log("ACESSEI O FEED MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()");
    var instrucao = `
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
                    WHERE salvo.fkUsuario = ${idUsuario}
                        ORDER BY dtSalvo;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function postMaisSalvo(idUsuario) {
    // console.log("ACESSEI O FEED MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()");
    var instrucao = `
    SELECT 
	COUNT(idPostagem) AS vezesSalvo,
    postagem.postagemSrc AS foto
		FROM postagem
            JOIN salvo ON idPostagem = fkPostagem
            JOIN usuario ON idUsuario = postagem.fkUsuario
				WHERE postagem.fkUsuario = ${idUsuario}
					GROUP BY foto
						ORDER BY vezesSalvo DESC
							LIMIT 1;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function postMenosSalvo(idUsuario) {
    // console.log("ACESSEI O FEED MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()");
    var instrucao = `
    SELECT 
	COUNT(idPostagem) AS vezesSalvo,
    postagem.postagemSrc AS foto
		FROM postagem
            JOIN salvo ON idPostagem = fkPostagem
            JOIN usuario ON idUsuario = postagem.fkUsuario
				WHERE postagem.fkUsuario = ${idUsuario}
					GROUP BY foto
						ORDER BY vezesSalvo
							LIMIT 1;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}


module.exports = {
    amostras,
    criarFeed,
    postar,
    salvarPost,
    removerPostSalvo,
    montarGrafico,
    atualizarGrafico,
    postsSalvos,
    postMaisSalvo,
    postMenosSalvo
}