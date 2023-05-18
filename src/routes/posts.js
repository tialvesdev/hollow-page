var express = require("express");
const upload = require('../config/configUpload'); // ARQUIVO COM A COFIGURAÇÃO DO UPLOAD
var router = express.Router();

var postController = require("../controllers/postController");

router.get("/", function (req, res) {
    postController.testar(req, res);
});

router.get('/feed', upload.single('foto'), (req, res) => {
    postController.feed(req, res);
  });

router.post("/post", upload.single('foto'), function (req, res) {
    postController.post(req, res);
});

module.exports = router;