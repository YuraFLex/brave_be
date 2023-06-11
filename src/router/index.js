const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const StatisitcsController = require('../controllers/StatisitcsController/StatisitcsController')
const router = new Router();

router.post("/login", userController.login);
router.get("/statistics/:id/:type", StatisitcsController.getStatistics);



module.exports = router;
