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

module.exports = {
    fichaVazia
}
