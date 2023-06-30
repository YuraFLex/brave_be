const EndPoint = require('../../models/EndPoint/EndPoint');
const EndPointDto = require('../../dtos/EndPointDto/EndPointDto');

class EndPointService {
    async getEndPointData(partnerId, type) {

        try {
            const result = await EndPoint.getEndPointList(partnerId, type);

            const endPointDtos = result.map(model => new EndPointDto(model));

            console.log('EndPointDtos в сервисе:', endPointDtos);

            return endPointDtos;
        } catch (error) {
            console.log('Ошибка при получении списка:', error);
            throw error;
        }
    }
}

module.exports = new EndPointService();
