const StatisticsService = require('../../services/statisctiсsService/statisctiсsService');

class StatisticsController {
    async getStatistics(req, res, next) {
        const { id, type } = req.params;
        const { period, endDate, endPoint, startDate } = req.query;

        StatisticsService.getFilteredStatistics(id, type, period, endDate, endPoint, startDate)
            .then((statisticsDto) => {
                res.json(statisticsDto);
            })
            .catch((error) => {
                next(error);
            });
    }
}

module.exports = new StatisticsController();