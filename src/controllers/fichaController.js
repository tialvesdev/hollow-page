var fichaModel = require("../models/fichaModel");

function fichaVazia(req, res) {
    const idUsuario = req.params.idUsuario;
    // console.log(`var idUsuario = ${idUsuario}`);

    fichaModel.inserirFichaVazia(idUsuario)
        .then(resultado => {
            res.json(resultado);
            
        }).catch(err => {
                console.log(err);
                console.log(
                    "\nHouve um erro ao cadastrar a ficha! Erro: ",
                    err.sqlMessage
                );
                res.status(500).json(err.sqlMessage);

        });
        
}

function fichaSemFoto(req, res) {
    const idUsuario = req.params.idUsuario;

    // console.log(req.params, req);

    const genero = req.body.genero;
    const tel = req.body.tel;

    fichaModel.inserirFichaSemFoto(idUsuario, genero, tel)
        .then(resultado => {
            res.json(resultado);
            
        }).catch(err => {
                console.log(err);
                console.log(
                    "\nHouve um erro ao cadastrar a ficha! Erro: ",
                    err.sqlMessage
                );
                res.status(500).json(err.sqlMessage);

        });
        
}

function fichaComFoto(req, res) {

    
    // const imagem = req.file.filename;
    // const { titulo, descricao, idUsuario } = req.body
    // const post = { imagem, titulo, descricao, idUsuario }

    const idUsuario = req.params.idUsuario;
    const genero = req.body.genero;
    const tel = req.body.tel;
    const imagem = req.file.filename;


    fichaModel.inserirFichaComFoto(idUsuario, genero, tel, imagem)
        .then(resultado => {
            res.json(resultado);
            
        }).catch(err => {
                console.log(err);
                console.log(
                    "\nHouve um erro ao cadastrar a ficha! Erro: ",
                    err.sqlMessage
                );
                res.status(500).json(err.sqlMessage);

        });
        
}

module.exports = {
    fichaVazia,
    fichaSemFoto,
    fichaComFoto
}
