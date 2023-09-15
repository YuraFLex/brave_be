const ChartService = require('../../services/ChartService/ChartService')

class ChartController {

    async getData(req, res, next) {
        const data = req.query;
        // console.log('Cahrt data:', data);

        try {
            const chartData = await ChartService.getChartData(data)
            res.json(chartData)

        } catch (error) {
            return next(error)
        }
    }

}

module.exports = new ChartController()