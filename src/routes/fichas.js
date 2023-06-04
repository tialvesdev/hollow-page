var express = require("express");
const upload = require('../config/configUpload');
var router = express.Router();

var fichaController = require("../controllers/fichaController");

router.post("/fichaVazia/:idUsuario", function (req, res) {
    fichaController.fichaVazia(req, res);
});

router.post("/fichaSemFoto/:idUsuario", function (req, res) {
    fichaController.fichaSemFoto(req, res);
});

router.post("/fichaComFoto/:idUsuario", upload.single('foto'), function (req, res) {
    fichaController.fichaComFoto(req, res);
});

module.exports = router;