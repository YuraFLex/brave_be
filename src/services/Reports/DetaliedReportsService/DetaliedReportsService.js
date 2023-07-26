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

        console.log('partner_id:', partnerId);
        console.log('type:', type);
        try {

            const result = await DetaliedReports.fetchSizesList(partnerId, type);

            // DetaliedReportsDto = result.map(model => new DetaliedReportsDto(model))
            // return DetaliedReportsDto    

            return result;

        } catch (error) {
            console.log('Ошибка при получении списка:', error);
            throw error;
        }
    }

}

module.exports = new DetaliedReportsService()