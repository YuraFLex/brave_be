const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const StatisitcsController = require('../controllers/StatisitcsController/StatisitcsController')
const ChangePasswordController = require('../controllers/ChangePasswordController/ChangePasswordController')
const EndPointController = require('../controllers/EndPointController/EndPointController')

const router = new Router();

router.post("/login", userController.login);
router.get("/statistics/:id/:type", StatisitcsController.getStatistics);
router.put('/changepassword', ChangePasswordController.changePassword);
router.get("/endpoint/:id/:type", EndPointController.getData);


module.exports = router;
