// statisticsService.js
const StatisticsDto = require('../../dtos/showStatisctiksDto/showStatisticsDto');
const Statistics = require('../../models/Statisitcs/Statisitcs');

class StatisticsService {
    async getFilteredStatistics(partnerId, type, period, endDate, endPoint, startDate) {
        try {
            const result = await Statistics.getStatistics(partnerId, type, startDate, endDate, endPoint, period);

            const statResult = new StatisticsDto(result);

            return statResult;

        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
            throw new Error(`Ошибка при получении статистики: ${error.message}`);
        }
    }
}

module.exports = new StatisticsService();
