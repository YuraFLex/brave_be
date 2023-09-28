const SummaryReports = require('../../../models/Reports/SummaryReports');
const SummaryReportsDto = require('../../../dtos/Reports/SummaryReports');

class SummaryReportsService {
    async getSummary(data) {
        const { partner_id, type, displayBy, endPointUrl, period, startDate, endDate } = data;

        try {
            const result = await SummaryReports.fetchSumReports(partner_id, type, displayBy, endPointUrl, period, startDate, endDate,);

            if (result) {
                const reportResult = new SummaryReportsDto(result);
                reportResult.period = period;
                reportResult.displayBy = displayBy;

                return {
                    success: true,
                    message: 'Your Summary Report is Ready',
                    summaryData: reportResult,
                }
            } else {
                return {
                    success: false,
                    message: 'Error when receiving a summary report'
                }
            }

        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

module.exports = new SummaryReportsService();
