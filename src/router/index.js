const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const StatisitcsSspController = require('../controllers/StatisitcsSspController/StatisitcsSspController')
const router = new Router();

router.post("/login", userController.login);
router.get("/sspstat/:id/:type", StatisitcsSspController.getSspStat);



module.exports = router;
