const DownloadCsvService = require("../../services/Reports/DownloadCsvService");

class DownloadCsvController {
    async getCsvFile(req, res, next) {
        const data = req.body;

        try {
            const result = await DownloadCsvService.createCsvFile(data);
            console.log('Result в контроллере:', result);
            const { csv, filename } = result;
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'text/csv');
            res.send(csv);
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = new DownloadCsvController();


