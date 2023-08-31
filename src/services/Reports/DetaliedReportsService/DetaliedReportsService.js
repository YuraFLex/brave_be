const DetaliedReports = require('../../../models/Reports/DetaliedReports')
const DetaliedReportsDto = require('../../../dtos/Reports/DetaliedReports')

class DetaliedReportsService {
    async getDetalied(data) {

        const { partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, groupBy } = data;

        try {
            const result = await DetaliedReports.fetchDetReports(partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, groupBy);

            const reportResult = new DetaliedReportsDto(result)
            reportResult.period = period;
            reportResult.displayBy = displayBy;
            reportResult.groupBy = groupBy;

            return reportResult;
        } catch (error) {
            console.log(error);
        }
    }




    async getSizesList(partnerId, type) {
        try {
            const result = await DetaliedReports.fetchSizesList(partnerId, type);

            result.sort((a, b) => {
                const sizeA = parseInt(a.size.split('x')[0]);
                const sizeB = parseInt(b.size.split('x')[0]);
                const sizeNumberComparison = sizeA - sizeB;

                if (sizeNumberComparison === 0) {
                    const restA = parseInt(a.size.split('x')[1]);
                    const restB = parseInt(b.size.split('x')[1]);
                    return restA - restB;
                }

                return sizeNumberComparison;
            });

            return result;
        } catch (error) {
            console.log('Ошибка при получении списка:', error);
            throw error;
        }
    }
}

module.exports = new DetaliedReportsService()