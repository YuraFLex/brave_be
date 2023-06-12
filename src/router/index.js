const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const StatisitcsController = require('../controllers/StatisitcsController/StatisitcsController')
const ChangePasswordController = require('../controllers/ChangePasswordController/ChangePasswordController')

const router = new Router();

router.post("/login", userController.login);
router.get("/statistics/:id/:type", StatisitcsController.getStatistics);
router.put('/changepassword', ChangePasswordController.changePassword);



module.exports = router;
