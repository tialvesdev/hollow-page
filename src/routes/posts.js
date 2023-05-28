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

router.get('/feed', upload.single('foto'), (req, res) => {
    postController.feed(req, res);
});

router.post("/post", upload.single('foto'), function (req, res) {
    postController.post(req, res);
});

router.post("/save/:idPostagem/:idUsuario", function (req, res) {
    postController.save(req, res);
});

router.delete("/unsave/:idPostagem/:idUsuario", function (req, res) {
    postController.unsave(req, res);
});
  

module.exports = router;