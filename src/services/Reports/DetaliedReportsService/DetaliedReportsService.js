const DetaliedReports = require('../../../models/Reports/DetaliedReports')

class DetaliedReportsService {
    async getDetalied(data) {

        console.log('Дата в сервисе:', data);

        const { partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, platform, region, checkedItems } = data;


        try {

            const detaliedReportsDto = await DetaliedReports.fetchDetReports(partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, platform, region);
            detaliedReportsDto.labels = checkedItems.labels;
            detaliedReportsDto.isChecked = checkedItems.isChecked;
            detaliedReportsDto.period = period;
            detaliedReportsDto.displayBy = displayBy;
            return detaliedReportsDto;

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