var usuarioModel = require("../models/usuarioModel");

var sessoes = [];

function testar(req, res) {
    console.log("ENTRAMOS NA usuarioController");
    res.json("ESTAMOS FUNCIONANDO!");
}

function listar(req, res) {
    usuarioModel.listar()
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!")
            }
        }).catch(
            function (erro) {
                console.log(erro);
                console.log("Houve um erro ao realizar a consulta! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function entrar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else if (!email.includes('@')) {
        res.status(400).send("Seu email não tem @!");
    } else if (email.substring(email.indexOf('@') + 1) == "") {
        res.status(400).send("Seu email não tem provedor!");
    } else {
        
        usuarioModel.entrar(email, senha)
            .then(
                function (resultado) {
                    console.log(`\nResultados encontrados: ${resultado.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultado)}`);

                    if (resultado.length == 1) {
                        console.log(resultado);
                        res.json(resultado[0]);

                    } else if (resultado.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }

                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var confirmarSenha = req.body.confirmacaoSenhaServer;
    var dtNasc = req.body.dtNascServer;

    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (dtNasc == undefined) {
        res.status(400).send("Sua data de nascimento está undefined!");
    } else if (senha != confirmarSenha) {
        res.status(400).send("Sua senha deve ser confirmada!");
    } else {
        
        usuarioModel.cadastrar(nome, email, senha, dtNasc)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

function profile(req, res) {

    const idUsuario = req.params.idUsuario;
    // console.log(`var idUsuario = ${idUsuario}`);

    usuarioModel.mostrarPerfil(idUsuario)
        .then(resultado => {
            if (resultado.length >= 1 ) {

                res.json(resultado);
            } else {
                // res.status(403).send('')
            }
        }).catch(err => {
            res.status(500).send(err);
        });
        
}

function profilePosts(req, res) {

    const idUsuario = req.params.idUsuario;

    usuarioModel.mostrarPerfilPosts(idUsuario)
        .then(resultado => {
            if (resultado.length >= 1 ) {

                res.json(resultado);
            } else {
                // res.status(403).send('')
            }
        }).catch(err => {
            res.status(500).send(err);
        });
        
}

function editar(req, res) {

    // var idUsuario = req.body.idUsuarioVar;
    // var nome = req.body.nomeVar;
    // var email = req.body.emailVar;
    // var dtNasc = req.body.dtNascVar;
    // var fotoPerfil = req.body.fotoPerfilVar;
    // var genero = req.body.generoVar;
    // var tel = req.body.telVar;
    // var fotoCapa = req.body.fotoCapaVar;

    console.log(req.file.filename);

    const fotoPerfil = req.file.filename;
    const { idUsuarioVar, nomeVar, emailVar, dtNascVar, generoVar, telVar, fotoCapaVar } = req.body
    const usuario = { fotoPerfil, idUsuarioVar, nomeVar, emailVar, dtNascVar, generoVar, telVar, fotoCapaVar }

    // console.log(tel);
    // if (nome == undefined) {
    //     res.status(400).send("Seu nome está undefined!");
    // } else if (email == undefined) {
    //     res.status(400).send("Seu email está undefined!");
    // } else if (senha == undefined) {
    //     res.status(400).send("Sua senha está undefined!");
    // } else if (dtNasc == undefined) {
    //     res.status(400).send("Sua data de nascimento está undefined!");
    // } else if (senha != confirmarSenha) {
    //     res.status(400).send("Sua senha deve ser confirmada!");
    // } else {
        
        usuarioModel.editarUsuario(usuario)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    // }
}

function excluir(req, res) {

    const idUsuario = req.params.idUsuario;

    usuarioModel.excluirPerfil(idUsuario)
        .then(resultado => {
        //     if (resultado.length >= 1 ) {

                res.json(resultado);
            // } else {
                // res.status(403).send('')
            // }
        }).catch(err => {
            res.status(500).send(err);
        });
        
}

module.exports = {
    entrar,
    cadastrar,
    listar,
    testar,
    profile,
    profilePosts,
    editar,
    excluir
}