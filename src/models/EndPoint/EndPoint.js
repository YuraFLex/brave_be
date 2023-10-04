const db = require('../../config/db');
const { promisify } = require('util');

const EndPoint = {

    getEndPointList: async function (partnerId) {
        const query = `
            SELECT 
                id, point, active, prebid_pid 
            FROM 
                brave_new.dsp_points dp 
            WHERE 
                partner_id = ?
                AND active = 1`;

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);
            const result = await queryAsync(query, [partnerId]);

            const endPointList = result.map(entry => {
                const point = entry.point.trim();
                const newPoint = point === '' ? entry.prebid_pid : point;
                return { id: entry.id, point: newPoint, active: entry.active, prebid_pid: entry.prebid_pid };
            });

            return endPointList;
        } catch (error) {
            console.log(error);
        } finally {
            connection.end();
        }
    },

    getEndPointSSPList: async function (partner_id) {
        const query = ` 
            SELECT 
               id, pass, active
            FROM 
                brave_new.ssp_points sp 
            WHERE 
                partner_id = ?
                AND active = 1`;

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);
            const result = await queryAsync(query, [partner_id])
            return result

        } catch (error) {
            console.log(error);
        } finally {
            connection.end();
        }
    }
};

module.exports = EndPoint;
