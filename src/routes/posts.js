var express = require("express");
var router = express.Router();

var postsController = require("../controllers/postController");

router.get("/", function (req, res) {
    postController.testar(req, res);
});

router.get("/feed", function (req, res) {
    postController.feed(req, res);
});

module.exports = router;