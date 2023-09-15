const EndPointService = require('../../services/EndPointService/EndPointService');

class EndPointController {
    async getData(req, res, next) {
        const { id, type } = req.params;

        if (type === "DSP") {
            try {
                const endPointDtos = await EndPointService.getEndPointData(id);
                res.json(endPointDtos);
            } catch (error) {
                next(error);
            }
        } else if (type === 'SSP') {
            try {
                const endPointDtos = await EndPointService.getEndPointSSPData(id);
                res.json(endPointDtos);
            } catch (error) {
                next(error);
            }
        } else {
            res.status(400).json({ error: 'Invalid partner type' });
        }
    }
}

module.exports = new EndPointController();
