var fundoPerfilModel = require("../models/fundoPerfilModel");
var path = require("path");

function testar(req, res) {
    console.log("ENTRAMOS NA postController");
    res.json("ESTAMOS FUNCIONANDO!");
}

function listar(req, res) {

    fundoPerfilModel.listarFundos()
        .then(resultado => {
            res.json(resultado);
        }).catch(err => {
            res.status(500).send(err);
        });

}

module.exports = {
    testar,
    listar
}