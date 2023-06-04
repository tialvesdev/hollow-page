var database = require("../database/config")

function inserirFichaVazia(idUsuario) {    
    var instrucao = `
        INSERT INTO ficha (fkUsuario) VALUES ('${idUsuario}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

module.exports = {
    inserirFichaVazia
};