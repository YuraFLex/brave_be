const db = require("../../config/db");

const StatisticsSsp = {
    getStatisticsSsp: function (partner_id, type) {
        return new Promise((resolve, reject) => {
            const query = `SELECT ssp, bids_ssp_cnt, impressions_cnt, bids_ssp_sum, impressions_ssp_sum
                     FROM statistic
                     INNER JOIN partners ON statistic.ssp = partners.id
                     WHERE statistic.ssp = ?;`;

            const values = [partner_id, type];

            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length === 0) {
                        resolve(null);
                    } else {
                        const sspStat = results[0];
                        resolve(sspStat);
                    }
                }
            });
        });
    },
};

module.exports = StatisticsSsp;
