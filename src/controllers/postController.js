var postModel = require("../models/postModel");
var path = require("path");

var multer = require('multer');
var fs = require('fs');

var upload = multer({ dest: './public/assets/bucket/' });

function testar(req, res) {
    console.log("ENTRAMOS NA postController");
    res.json("ESTAMOS FUNCIONANDO!");
}

function feed(req, res) {

    postModel.criarFeed()
        .then(resultado => {
            res.json(resultado);
        }).catch(err => {
            res.status(500).send(err);
        });

    // postModel.listarFeed()
    //     .then(function (resultado) {
    //         if (resultado.length > 0) {
    //             res.status(200).json(resultado);
    //         } else {
    //             res.status(204).send("Nenhum post encontrado!")
    //         }
    //     }).catch(
    //         function (erro) {
    //             console.log(erro);
    //             console.log("Houve um erro ao realizar a consulta! Erro: ", erro.sqlMessage);
    //             res.status(500).json(erro.sqlMessage);
    //         }
    //     );
}

function post(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    // var titulo = req.body.tituloServer;
    // var descricao = req.body.descricaoServer;
    // var foto = req.body.fotoServer;
    // var idUsuario = req.body.idUsuarioServer;

    // Faça as validações dos valores
    // if (nome == undefined) {
    //     res.status(400).send("Seu nome está undefined!");
    // } else if (email == undefined) {
    //     res.status(400).send("Seu email está undefined!");
    // } else if (senha == undefined) {
    //     res.status(400).send("Sua senha está undefined!");
    // } else {

    const imagem = req.file.filename;

    const { titulo, descricao, idUsuario } = req.body

    const post = { imagem, titulo, descricao, idUsuario }

    // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
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
    // }
}

function profile(req, res) {

    var idUsuario = req.params.idUsuario;
    // console.log(`var idUsuario = ${idUsuario}`);

    postModel.mostrarPerfil(idUsuario)
        .then(resultado => {
            res.json(resultado);
        }).catch(err => {
            res.status(500).send(err);
        });
        
}

module.exports = {
    testar,
    feed,
    post,
    profile
}