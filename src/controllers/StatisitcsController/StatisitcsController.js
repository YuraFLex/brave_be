const StatisticsService = require('../../services/statisctiсsService/statisctiсsService');

class StatisticsController {
    getStatistics(req, res, next) {
        const { id, type } = req.params;

        if (type === 'SSP') {
            StatisticsService.getSSPStatistics(id, type)
                .then((statisticsDto) => {
                    res.json(statisticsDto);
                })
                .catch((error) => {
                    next(error);
                });
        } else if (type === 'DSP') {
            StatisticsService.getDSPStatistics(id, type)
                .then((statisticsDto) => {
                    res.json(statisticsDto);
                })
                .catch((error) => {
                    next(error);
                });
        } else {
            res.status(400).json({ error: 'Invalid partner type' });
        }
    }
}

module.exports = new StatisticsController();
