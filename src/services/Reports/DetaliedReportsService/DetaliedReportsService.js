const DetaliedReports = require('../../../models/Reports/DetaliedReports')
const DetaliedReportsDto = require('../../../dtos/Reports/DetaliedReports')

class DetaliedReportsService {
    async getDetalied(data) {

        console.log('Дата в сервисе:', data);

        const { partner_id, type, period, startDate, endDate, displayBy, size, traffictype, platform, region, checkedItems } = data;


        try {

            // const result = await DetaliedReports

        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new DetaliedReportsService()