var express = require("express");
var router = express.Router();

var postController = require("../controllers/postController");

router.get("/", function (req, res) {
    postController.testar(req, res);
});

router.get("/feed", function (req, res) {
    postController.feed(req, res);
});

router.post("/post", function (req, res) {
    postController.post(req, res);
});

module.exports = router;