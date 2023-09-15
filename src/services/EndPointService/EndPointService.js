const EndPoint = require('../../models/EndPoint/EndPoint');
const EndPointDto = require('../../dtos/EndPointDto/EndPointDto');

class EndPointService {
    async getEndPointData(partnerId) {

        try {
            const result = await EndPoint.getEndPointList(partnerId);

            const endPointDtos = result.map(model => new EndPointDto(model));

            return endPointDtos;
        } catch (error) {
            console.log('Ошибка при получении списка:', error);
            throw error;
        }
    }

    async getEndPointSSPData(partner_id) {
        try {
            const result = await EndPoint.getEndPointSSPList(partner_id);

            const endPointDtos = result.map(model => {

                const modifiedPass = `http://point.braveglobal.tv/?t=1&partner=${model.pass}`;

                return new EndPointDto({ ...model, pass: modifiedPass });
            });

            return endPointDtos;

        } catch (error) {
            console.log('Ошибка при получении списка:', error);
            throw error;
        }
    }

}

module.exports = new EndPointService();
