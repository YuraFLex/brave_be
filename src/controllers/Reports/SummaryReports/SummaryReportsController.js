const SummaryReportsService = require('../../../services/Reports/SummaryReportsService/SummaryReportsService');

class SummaryReportsController {
    async getSummaryReports(req, res, next) {
        const data = req.query;

        console.log('Summary Reports Data:', data);

        try {
            const summaryData = await SummaryReportsService.getSummary(data);
            res.json(summaryData);
        } catch (e) {
            return next(e);
        }
    }
}

module.exports = new SummaryReportsController();
