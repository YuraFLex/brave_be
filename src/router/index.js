const Router = require("express").Router;
const userController = require("../controllers/UserController/UserController");
const StatisitcsController = require('../controllers/StatisitcsController/StatisitcsController')
const ChangePasswordController = require('../controllers/ChangePasswordController/ChangePasswordController')
const EndPointController = require('../controllers/EndPointController/EndPointController')
const SummaryReportsController = require('../controllers/Reports/SummaryReports/SummaryReportsController')
const DetaliedReportsController = require('../controllers/Reports/DetaliedReports/DetaliedReportsController');
const DownloadCsvController = require("../controllers/Reports/DownloadCsvController");
const ChartController = require('../controllers/ChartController/ChartController')

const router = new Router();

router.post("/login", userController.login);
router.get("/statistics/:id/:type", StatisitcsController.getStatistics);
router.put("/changepassword", ChangePasswordController.changePassword);
router.get("/endpoint/:id/:type", EndPointController.getData);
router.get("/reports/summary", SummaryReportsController.getSummaryReports);
router.get("/reports/detalied", DetaliedReportsController.getDetaliedReports);
router.post("/reports/download", DownloadCsvController.getCsvFile);
router.get("/reports/detalied/:id/:type", DetaliedReportsController.getSizesList);
router.get('/statistics/chart_data', ChartController.getData)


module.exports = router;
