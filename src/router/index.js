const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const router = new Router();

router.post("/login", userController.login);

module.exports = router;
