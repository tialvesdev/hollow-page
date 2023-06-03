var express = require("express");
const upload = require('../config/configUpload');
var router = express.Router();

var fichaController = require("../controllers/fichaController");


router.post("/fichaVazia/:idUsuario", function (req, res) {
    fichaController.fichaVazia(req, res);
});

module.exports = router;