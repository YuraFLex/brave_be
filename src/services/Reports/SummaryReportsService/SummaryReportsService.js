const SummaryReports = require('../../../models/Reports/SummaryReports');
const SummaryReportsDto = require('../../../dtos/Reports/SummaryReports');

class SummaryReportsService {
    async getSummary(data) {
        const { partner_id, type, displayBy, endPointUrl, period, startDate, endDate } = data;

        try {
            const result = await SummaryReports.fetchSumReports(partner_id, type, displayBy, endPointUrl, period, startDate, endDate,);

            const reportResult = new SummaryReportsDto(result);
            reportResult.period = period;
            reportResult.displayBy = displayBy;

            return reportResult;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}

module.exports = new SummaryReportsService();
