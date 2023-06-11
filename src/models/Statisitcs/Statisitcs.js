const db = require("../../config/db");

const Statistics = {
    getStatistics: function (partner_id, type) {
        let query;

        if (type === 'SSP') {
            query = `
        SELECT s.ssp, s.bids_ssp_cnt, s.impressions_ssp_sum, s.bids_ssp_sum
        FROM statistic s
        INNER JOIN ssp_points sp ON s.ssp = sp.id
        INNER JOIN partners p ON sp.partner_id = p.id
        WHERE p.id = ?`;
        } else if (type === 'DSP') {
            query = `
        SELECT s.dsp, s.bids_dsp_cnt, s.impressions_dsp_sum, s.bids_dsp_sum
        FROM statistic s
        INNER JOIN dsp_points dp ON s.dsp = dp.id
        INNER JOIN partners p ON dp.partner_id = p.id
        WHERE p.id = ?`;
        } else {
            throw new Error('Invalid partner type');
        }

        return new Promise((resolve, reject) => {
            const connection = db.createConnection();

            connection.connect(function (error) {
                if (error) {
                    reject(error);
                } else {
                    connection.query(query, [partner_id], (error, results) => {
                        connection.end();

                        if (error) {
                            reject(error);
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    },
};

module.exports = Statistics;
