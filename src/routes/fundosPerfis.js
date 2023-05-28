var express = require("express");
var router = express.Router();
// const upload = require('../config/configUpload');

var fundoPerfilController = require("../controllers/fundoPerfilController");

router.get("/", function (req, res) {
    fundoPerfilController.testar(req, res);
});

router.get('/listar', function (req, res) {
    fundoPerfilController.listar(req, res);
});

module.exports = router;