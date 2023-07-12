const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const StatisitcsController = require('../controllers/StatisitcsController/StatisitcsController')
const ChangePasswordController = require('../controllers/ChangePasswordController/ChangePasswordController')
const EndPointController = require('../controllers/EndPointController/EndPointController')
const SummaryReportsController = require('../controllers/Reports/SummaryReports/SummaryReportsController')

const router = new Router();

router.post("/login", userController.login);
router.get("/statistics/:id/:type", StatisitcsController.getStatistics);
router.put("/changepassword", ChangePasswordController.changePassword);
router.get("/endpoint/:id/:type", EndPointController.getData);
router.get("/reports/summary", SummaryReportsController.getSummaryReports)


module.exports = router;
