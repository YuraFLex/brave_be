const ChartService = require('../../services/ChartService/ChartService')

class ChartController {

    async getData(req, res, next) {

        try {
            const data = req.query;

            console.log('data:', data);
            const chartData = await ChartService.getChartData(data)

            if (chartData.success) {
                return res.status(200).json(chartData)

            } else {
                return res.status(401).json(chartData)
            }

        } catch (error) {
            return next(error)
        }
    }

}

module.exports = new ChartController()