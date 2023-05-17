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
    postModel.listarFeed()
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum post encontrado!")
            }
        }).catch(
            function (erro) {
                console.log(erro);
                console.log("Houve um erro ao realizar a consulta! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function post(req, res) {
    // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
    var titulo = req.body.tituloServer;
    var descricao = req.body.descricaoServer;
    var foto = req.body.fotoServer;
    var idUsuario = req.body.idUsuarioServer;

    // Faça as validações dos valores
    // if (nome == undefined) {
    //     res.status(400).send("Seu nome está undefined!");
    // } else if (email == undefined) {
    //     res.status(400).send("Seu email está undefined!");
    // } else if (senha == undefined) {
    //     res.status(400).send("Sua senha está undefined!");
    // } else {

    // app.post('/upload', upload.single('imagem'), (req, res) => {
    //     console.log('Rota de upload acionada');
    //     console.log('Arquivo recebido:', req.file);
      
    //     const tempPath = req.file.path;
    //     const targetPath = path.join(__dirname, './public/assets/bucket/' + req.file.originalname);
    //     console.log('Caminho temporário:', tempPath);
    //     console.log('Caminho de destino:', targetPath);
      
    //     // Mover o arquivo temporário recebido pelo Multer para o local de destino desejado.
    //     fs.rename(tempPath, targetPath, err => {
    //       if (err) throw err;
      
    //       // Salvar o caminho da imagem no banco de dados
    //       const imagePath = './public/assets/bucket/' + req.file.originalname;
    //       console.log('Caminho da imagem:', imagePath);
      
    //       // Salvar imagePath no banco de dados
      
    //       res.send('Imagem salva com sucesso!');
    //     });
    //   });
        
        // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
        postModel.postar(titulo, descricao, foto, idUsuario)
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

module.exports = {
    testar,
    feed,
    post
}