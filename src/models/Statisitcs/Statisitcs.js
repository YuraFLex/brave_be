
const db = require("../../config/db");
const { promisify } = require("util");

const Statistics = {
    getStatistics: async function (partner_id, type) {
        let query;

        if (type === "SSP") {
            query = `
        SELECT s.ssp, SUM(s.bids_ssp_cnt) AS bids_ssp_cnt, SUM(s.impressions_ssp_sum) AS impressions_ssp_sum, SUM(s.bids_ssp_sum) AS bids_ssp_sum
        FROM statistic s
        INNER JOIN ssp_points sp ON s.ssp = sp.id
        INNER JOIN partners p ON sp.partner_id = p.id
        WHERE p.id = ?`;
        } else if (type === "DSP") {
            query = `
        SELECT s.dsp, SUM(s.bids_dsp_cnt) AS bids_dsp_cnt, SUM(s.impressions_dsp_sum) AS impressions_dsp_sum, SUM(s.bids_dsp_sum) AS bids_dsp_sum
        FROM statistic s
        INNER JOIN dsp_points dp ON s.dsp = dp.id
        INNER JOIN partners p ON dp.partner_id = p.id
        WHERE p.id = ?`;
        } else {
            throw new Error("Invalid partner type");
        }

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);
            const results = await queryAsync(query, [partner_id]);

            return results[0];
        } catch (error) {
            throw new Error(`Error retrieving statistics: ${error.message}`);
        } finally {
            connection.end();
        }
    },
};

module.exports = Statistics;