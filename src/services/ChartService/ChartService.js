const Chart = require('../../models/Chart/Chart');
const ChartDto = require('../../dtos/ChartDto/ChartDto');

class ChartService {
    async getChartData(data) {
        const { partnerId, type, period, endPoint, startDate, endDate } = data;

        try {
            const result = await Chart.fetchChartData(partnerId, type, period, endPoint, startDate, endDate);

            if (result) {
                const chartResult = new ChartDto(result);

                const formatStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
                const formatEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : '';

                const labelPeriod =
                    period === 'today'
                        ? 'Today'
                        : period === 'yesterday'
                            ? 'Yesterday'
                            : period === 'lastweek'
                                ? 'Last 7 Days'
                                : period === 'thismonth'
                                    ? 'This Month'
                                    : period === 'lastmonth'
                                        ? 'Last Month'
                                        : period === 'custom'
                                            ? `Custom from "${formatStartDate}" to "${formatEndDate}" date`
                                            : '';

                return {
                    success: true,
                    message: `Successfully loaded data for the period ${labelPeriod}`,
                    chartData: chartResult,
                };
            } else {
                return {
                    success: false,
                    message: "Ошибка при загрузке данных",
                };
            }
        } catch (error) {
            console.log('fetchChartData error:', error);
        }
    }
}

module.exports = new ChartService();
