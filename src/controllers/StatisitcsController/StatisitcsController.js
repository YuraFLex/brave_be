const StatisticsService = require('../../services/statisctiсsService/statisctiсsService');

class StatisticsController {
    getStatistics(req, res, next) {
        const { id, type } = req.params;
        const { period, endDate, endPoint, startDate } = req.query;

        console.log('period в контроллере:', period);
        console.log('endDate в контроллере:', endDate);
        console.log('endPoint в контроллере:', endPoint);
        console.log('startDate в контроллере:', startDate);

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