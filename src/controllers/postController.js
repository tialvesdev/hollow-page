var postModel = require("../models/postModel");
var path = require("path");

var multer = require('multer');
var fs = require('fs');

var upload = multer({ dest: './public/assets/bucket/' });

function testar(req, res) {
    console.log("ENTRAMOS NA postController");
    res.json("ESTAMOS FUNCIONANDO!");
}

function samples(req, res) {

    postModel.amostras()
        .then(resultado => {
            res.json(resultado);
        }).catch(err => {
            res.status(500).send(err);
        });

}

function feed(req, res) {

    postModel.criarFeed()
        .then(resultado => {
            res.json(resultado);
        }).catch(err => {
            res.status(500).send(err);
        });

}

function post(req, res) {
    
    const imagem = req.file.filename;
    const { titulo, descricao, idUsuario } = req.body
    const post = { imagem, titulo, descricao, idUsuario }

    postModel.postar(post)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao realizar o post! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}



function save(req, res) {

    const idPostagem = req.params.idPostagem;
    const idUsuario = req.params.idUsuario;

    postModel.salvarPost(idPostagem, idUsuario)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao salvar o post! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function unsave(req, res) {

    const idPostagem = req.params.idPostagem;
    const idUsuario = req.params.idUsuario;

    postModel.removerPostSalvo(idPostagem, idUsuario)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao salvar o post! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

module.exports = {
    testar,
    samples,
    feed,
    post,
    save,
    unsave
}