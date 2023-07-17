const db = require('../../config/db');
const { promisify } = require('util')


const DetaliedReports = {

    fetchDetReports: async function (partner_id, type, period, startDate, endDate, displayBy, size, traffictype, platform, region,) {
        type = type.toLowerCase()
        let query;
        let dateStart, dateEnd;

        const currentDate = new Date()

        query = ``;

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection)

            const result = await queryAsync(query, [partner_id, dateStart, dateEnd])

            return result[0]

        } catch (error) {
            throw new Error(`Error retrieving detalied reports: ${error.message} `);
        } finally {
            connection.end();
        }
    }


}

module.exports = DetaliedReports;