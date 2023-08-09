const DetaliedReports = require('../../../models/Reports/DetaliedReports')

class DetaliedReportsService {
    async getDetalied(data) {

        const { partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, checkedItems } = data;

        try {
            const detaliedReportsDto = await DetaliedReports.fetchDetReports(partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType,);
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