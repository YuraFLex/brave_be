const DetaliedReportsService = require('../../../services/Reports/DetaliedReportsService/DetaliedReportsService')

class DetaliedReportsController {
    async getDetaliedReports(req, res, next) {
        const data = req.query;
        console.log('DATA:', data);

        try {
            const detaliedData = await DetaliedReportsService.getDetalied(data)
            res.json(detaliedData)
        } catch (error) {
            return next(error)
        }
    }

    async getSizesList(req, res, next) {
        const { id, type } = req.params;

        try {
            const result = await DetaliedReportsService.getSizesList(id, type)
            res.json(result)
        } catch (error) {
            return next(error);
        }

    }
}

module.exports = new DetaliedReportsController()