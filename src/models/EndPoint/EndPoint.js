const db = require('../../config/db');
const { promisify } = require('util');

const EndPoint = {
    getEndPointList: async function (partnerId, type) {

        let tableName = '';
        if (type === 'SSP') {
            tableName = 'ssp_points';
        } else if (type === 'DSP') {
            tableName = 'dsp_points';
        }

        const query = `SELECT id, name
            FROM ${tableName}
            WHERE partner_id = ?`;

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);
            const result = await queryAsync(query, [partnerId]);

            return result;
        } catch (error) {
            console.log(error);
        } finally {
            connection.end();
        }
    }
};

module.exports = EndPoint;
