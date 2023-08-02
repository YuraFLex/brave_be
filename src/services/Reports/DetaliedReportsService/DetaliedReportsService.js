const DetaliedReports = require('../../../models/Reports/DetaliedReports')
const DetaliedReportsDto = require('../../../dtos/Reports/DetaliedReports')

class DetaliedReportsService {
    async getDetalied(data) {

        console.log('Дата в сервисе:', data);

        const { partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, platform, region, checkedItems } = data;


        try {

            const result = await DetaliedReports.fetchDetReports(partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, platform, region, checkedItems)

            const reportResult = new DetaliedReportsDto(result)
            reportResult.labels = checkedItems.labels;
            reportResult.isChecked = checkedItems.isChecked;
            reportResult.period = period;
            reportResult.displayBy = displayBy;


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
                    const restA = a.size.substring(a.size.indexOf('x'));
                    const restB = b.size.substring(b.size.indexOf('x'));
                    return restA.localeCompare(restB);
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