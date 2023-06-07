const SspStatisticsService = require('../../services/sspStatisctiksService/sspStatisctiksService');

class StatisticsSspController {
    async getSspStat(req, res, next) {
        try {
            const { id } = req.params;
            const userDataSsp = await SspStatisticsService.getStatisticsSsp(id, req.query.type);

            console.log("SSP DATA IN SSP STAT CONTROLLER:", userDataSsp);
            return res.json(userDataSsp);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new StatisticsSspController();
