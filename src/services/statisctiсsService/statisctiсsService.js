const { sspStatisticsDto, dspStatisticsDto } = require('../../dtos/showStatisctiksDto/showStatisticsDto');
const Statistics = require('../../models/Statisitcs/Statisitcs');

class StatisticsService {
    async getSSPStatistics(partnerId, type) {
        console.log('Айди партнера в сервисе:', partnerId);
        console.log('Тип партнера в сервисе:', type);
        try {
            const result = await Statistics.getStatistics(partnerId, type);

            const statisticsDto = new sspStatisticsDto(result);
            console.log('Данные SSP:', statisticsDto);
            return statisticsDto;
        } catch (error) {
            console.error('Ошибка при получении статистики SSP:', error);
            throw new Error(`Ошибка при получении статистики SSP: ${error.message}`);
        }
    }

    async getDSPStatistics(partnerId, type) {
        try {
            const result = await Statistics.getStatistics(partnerId, type);

            const statisticsDto = new dspStatisticsDto(result);
            console.log('Данные DSP:', statisticsDto);
            return statisticsDto;
        } catch (error) {
            console.error('Ошибка при получении статистики DSP:', error);
            throw new Error(`Ошибка при получении статистики DSP: ${error.message}`);
        }
    }
}

module.exports = new StatisticsService();
