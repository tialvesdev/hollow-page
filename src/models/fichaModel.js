var database = require("../database/config")

function inserirFichaVazia(idUsuario) {
    var instrucao = `
        INSERT INTO ficha (fkUsuario) VALUES ('${idUsuario}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function inserirFichaSemFoto(idUsuario, genero, tel) {

    var instrucao;

    if (tel == '') {
        instrucao = `
            INSERT INTO ficha (fkUsuario, genero) VALUES ('${idUsuario}', '${genero}');
        `;

    } else {
        instrucao = `
            INSERT INTO ficha (fkUsuario, genero, tel) VALUES ('${idUsuario}', '${genero}', '${tel}');
        `;

    }

        console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function inserirFichaComFoto(idUsuario, genero, tel, imagem) {

    var instrucao;

    if (tel == '') {
        instrucao = `
            INSERT INTO ficha (fkUsuario, genero, fotoPerfilSrc) VALUES ('${idUsuario}', '${genero}', '../assets/bucket/${imagem}');
        `;

    } else {
        instrucao = `
            INSERT INTO ficha (fkUsuario, genero, tel, fotoPerfilSrc) VALUES ('${idUsuario}', '${genero}', '${tel}', '../assets/bucket/${imagem}');
        `;

    }

        console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

module.exports = {
    inserirFichaVazia,
    inserirFichaSemFoto,
    inserirFichaComFoto
};