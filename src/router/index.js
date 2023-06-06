const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const router = new Router();
const userService = require('../services/userService/userService')

router.post("/login", userController.login);


module.exports = router;
