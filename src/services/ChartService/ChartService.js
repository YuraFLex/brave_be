const Chart = require('../../models/Chart/Chart');
const ChartDto = require('../../dtos/ChartDto/ChartDto');

class ChartService {
    async getChartData(data) {

        try {
            const { partnerId, type, period, endPoint, startDate, endDate } = data;

            const result = await Chart.fetchChartData(partnerId, type, period, endPoint, startDate, endDate)

            const chartResult = new ChartDto(result)

            return chartResult;

        } catch (error) {
            console.log('fetchChartData error:', error);
        }
    }

}

module.exports = new ChartService()