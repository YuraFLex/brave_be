const SummaryReports = require('../../../models/Reports/SummaryReports');
const SummaryReportsDto = require('../../../dtos/Reports/SummaryReports');

class SummaryReportsService {
    async getSummary(data) {
        const { partner_id, type, displayBy, endPointUrl, period, startDate, endDate, checkedItems, timeZone } = data;

        try {
            const result = await SummaryReports.fetchSumReports(partner_id, type, displayBy, endPointUrl, period, startDate, endDate, timeZone);

            const reportResult = new SummaryReportsDto(result);
            reportResult.labels = checkedItems.labels;
            reportResult.isChecked = checkedItems.isChecked;
            reportResult.period = period;
            reportResult.displayBy = displayBy;
            console.log(reportResult);

            return reportResult;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}

module.exports = new SummaryReportsService();
