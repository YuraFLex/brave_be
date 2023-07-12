// statisticsService.js
const { sspStatisticsDto, dspStatisticsDto } = require('../../dtos/showStatisctiksDto/showStatisticsDto');
const Statistics = require('../../models/Statisitcs/Statisitcs');

class StatisticsService {
    async getFilteredStatistics(partnerId, type, period, endDate, endPoint, startDate) {
        try {
            const result = await Statistics.getStatistics(partnerId, type, startDate, endDate, endPoint, period);

            if (type === 'SSP') {
                const statisticsDto = new sspStatisticsDto(result);
                console.log(statisticsDto);
                return statisticsDto;
            } else if (type === 'DSP') {
                const statisticsDto = new dspStatisticsDto(result);
                console.log(statisticsDto);
                return statisticsDto;
            } else {
                throw new Error('Invalid partner type');
            }
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
            throw new Error(`Ошибка при получении статистики: ${error.message}`);
        }
    }
}

module.exports = new StatisticsService();
