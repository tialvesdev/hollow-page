var express = require("express");
const upload = require('../config/configUpload');
var router = express.Router();

var postController = require("../controllers/postController");

router.get("/", function (req, res) {
    postController.testar(req, res);
});

router.get('/samples', function (req, res) {
    postController.samples(req, res);
})

router.get('/feed/:idUsuario', (req, res) => {
    postController.feed(req, res);
});

router.post("/post", upload.single('fotoPostagem'), function (req, res) {
    postController.post(req, res);
});

router.post("/save/:idPostagem/:idUsuario", function (req, res) {
    postController.save(req, res);
});

router.delete("/unsave/:idPostagem/:idUsuario", function (req, res) {
    postController.unsave(req, res);
});

router.get("/montarGrafico/:idUsuario", function (req, res) {
    postController.montarGrafico(req, res);
});

router.get("/atualizarGrafico/:idUsuario", function (req, res) {
    postController.atualizarGrafico(req, res);
});

router.get("/savedPosts/:idUsuario", function (req, res) {
    postController.savedPosts(req, res);
});

router.get("/postMaisSalvo/:idUsuario", function (req, res) {
    postController.maisSalvo(req, res);
});

router.get("/postMenosSalvo/:idUsuario", function (req, res) {
    postController.menosSalvo(req, res);
});

module.exports = router;