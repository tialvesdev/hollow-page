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

    var idUsuario = req.params.idUsuario;

    postModel.criarFeed(idUsuario)
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

function montarGrafico(req, res) {

    const limite_linhas = 7;

    var idUsuario = req.params.idUsuario;

    console.log(`Recuperando os posts dos últimos ${limite_linhas} dias`);

    postModel.montarGrafico(idUsuario, limite_linhas).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar os posts dos últimos dias.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function atualizarGrafico(req, res) {

    var idUsuario = req.params.idUsuario;

    console.log(`Recuperando medidas em tempo real`);

    postModel.atualizarGrafico(idUsuario).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao atualizar o grafico.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function savedPosts(req, res) {

    var idUsuario = req.params.idUsuario;

    postModel.postsSalvos(idUsuario)
        .then(resultado => {
            res.json(resultado);
        }).catch(err => {
            res.status(500).send(err);
        });

}

function maisSalvo(req, res) {

    var idUsuario = req.params.idUsuario;

    postModel.postMaisSalvo(idUsuario)
        .then(resultado => {
            res.json(resultado);
        }).catch(err => {
            res.status(500).send(err);
        });

}

function menosSalvo(req, res) {

    var idUsuario = req.params.idUsuario;

    postModel.postMenosSalvo(idUsuario)
        .then(resultado => {
            res.json(resultado);
        }).catch(err => {
            res.status(500).send(err);
        });

}

function isSaved(req, res) {

    const idUsuario = req.params.idPostagem;
    const idPostagem = req.params.idPostagem;
    // console.log(`var idUsuario = ${idUsuario}`);

    postModel.verificarPostSalvo(idPostagem, idUsuario)
        .then(resultado => {
            res.json(resultado);

        }).catch(err => {
            res.status(500).send(err);
            
        });
        
}

module.exports = {
    testar,
    samples,
    feed,
    post,
    save,
    unsave,
    montarGrafico,
    atualizarGrafico,
    savedPosts,
    maisSalvo,
    menosSalvo,
    isSaved
}