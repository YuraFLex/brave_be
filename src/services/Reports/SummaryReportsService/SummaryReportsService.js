const SummaryReports = require('../../../models/Reports/SummaryReports');
const SummaryReportsDto = require('../../../dtos/Reports/SummaryReports');

class SummaryReportsService {
    async getSummary(data) {
        const { partner_id, type, displayBy, endpointId, period, startDate, endDate, checkedItems } = data;

        try {
            const result = await SummaryReports.fetchSumReports(partner_id, type, displayBy, endpointId, period, startDate, endDate);

            const reportResult = new SummaryReportsDto(result);
            reportResult.labels = checkedItems.labels;
            reportResult.isChecked = checkedItems.isChecked
            console.log(reportResult);

            return reportResult;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}

module.exports = new SummaryReportsService();
