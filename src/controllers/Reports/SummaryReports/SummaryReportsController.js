const SummaryReportsService = require('../../../services/Reports/SummaryReportsService/SummaryReportsService');

class SummaryReportsController {
    async getSummaryReports(req, res, next) {

        try {
            const data = req.query;
            const summaryData = await SummaryReportsService.getSummary(data);


            if (summaryData.success) {
                return res.status(200).json(summaryData)

            } else {
                return res.status(401).json(summaryData)
            }

        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new SummaryReportsController();
