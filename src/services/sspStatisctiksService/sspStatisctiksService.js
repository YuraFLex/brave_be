const StatisticsSsp = require('../../models/StatisitcsSsp/StatisitcsSsp');

class SspStatisticsService {
    async getStatisticsSsp(partner_id, type) {
        try {
            const sspStat = await StatisticsSsp.getStatisticsSsp(partner_id, type);
            return sspStat;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new SspStatisticsService();
