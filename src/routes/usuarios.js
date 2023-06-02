var express = require("express");
const upload = require('../config/configUpload');
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

router.get("/", function (req, res) {
    usuarioController.testar(req, res);
});

router.get("/listar", function (req, res) {
    usuarioController.listar(req, res);
});

router.post("/autenticar", function (req, res) {
    usuarioController.entrar(req, res);
});

router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

router.get('/profile/:idUsuario', (req, res) => {
    usuarioController.profile(req, res);
});

router.get('/profilePosts/:idUsuario', (req, res) => {
    usuarioController.profilePosts(req, res);
});

router.put('/editar',upload.single('fotoPerfilVar'), (req, res) => {
    usuarioController.editar(req, res);
});

router.delete('/excluir/:idUsuario', (req, res) => {
    usuarioController.excluir(req, res);
});

module.exports = router;