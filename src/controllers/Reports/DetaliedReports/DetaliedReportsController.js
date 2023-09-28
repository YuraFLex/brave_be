const DetaliedReportsService = require('../../../services/Reports/DetaliedReportsService/DetaliedReportsService')

class DetaliedReportsController {
    async getDetaliedReports(req, res, next) {

        try {
            const data = req.query;
            const detaliedData = await DetaliedReportsService.getDetalied(data)

            if (detaliedData.success) {
                return res.status(200).json(detaliedData)
            } else {
                return res.status(401).json(detaliedData)
            }


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