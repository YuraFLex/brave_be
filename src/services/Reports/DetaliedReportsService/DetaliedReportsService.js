const DetaliedReports = require('../../../models/Reports/DetaliedReports')
const DetaliedReportsDto = require('../../../dtos/Reports/DetaliedReports')

class DetaliedReportsService {
    async getDetalied(data) {

        console.log('Дата в сервисе:', data);

        const { partner_id, type, period, startDate, endDate, displayBy, size, traffictype, platform, region, checkedItems } = data;


        try {

            const result = await DetaliedReports.fetchDetReports(partner_id, type, period, startDate, endDate, displayBy, size, traffictype, platform, region, checkedItems)

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
                const sizeA = parseInt(a.size.replace('x', ''));
                const sizeB = parseInt(b.size.replace('x', ''));
                return sizeA - sizeB;
            });

            return result;
        } catch (error) {
            console.log('Ошибка при получении списка:', error);
            throw error;
        }
    }
}

module.exports = new DetaliedReportsService()