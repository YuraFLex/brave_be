const db = require('../../config/db');
const { promisify } = require('util');

const SummaryReports = {
    roundValue(value) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            const roundedValue = Math.round(parsedValue * 100) / 100;
            return roundedValue.toFixed(2);
        }
        return value;
    },

    fetchSumReports: async function (partner_id, type, displayBy, endpointId, period, startDate, endDate) {
        type = type.toLowerCase()
        let query;

        let dateStart, dateEnd;

        const currentDate = new Date();

        if (period === 'today') {
            dateStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0).getTime() / 1000;
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else if (period === 'yesterday') {
            const yesterday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 0, 0, 0);
            dateStart = Math.floor(yesterday.getTime() / 1000);
            dateEnd = Math.floor(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 23, 59, 59).getTime() / 1000);
        } else if (period === 'lastweek') {
            const lastWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6, 0, 0, 0);
            dateStart = Math.floor(lastWeekStart.getTime() / 1000);
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else if (period === 'lastmonth') {
            const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 0, 0, 0);
            dateStart = Math.floor(lastMonthStart.getTime() / 1000);
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else {
            dateStart = Math.floor(new Date(startDate).setHours(0, 0, 0, 0) / 1000);
            dateEnd = Math.floor(new Date(endDate).setHours(23, 59, 59, 999) / 1000);
        }


        query = `
            SELECT
                p.id AS partner_id,
                SUM(s.timeouts_cnt) AS timeouts,
                SUM(s.impressions_cnt) AS impressions,
                SUM(s.requests_cnt) AS requests,
                SUM(s.bids_${type}_cnt) AS responses,
                SUM(s.impressions_${type}_sum) AS spend,
                SUM(s.impressions_cnt)/SUM(s.bids_${type}_cnt)*100 AS win_rate,
                SUM(s.impressions_cnt) AS impressions,
                SUM(s.impressions_${type}_sum) AS gross_point
            FROM
                brave_new.statistic s
            LEFT JOIN
                ${type === 'ssp' ? 'brave_new.ssp_points sp ON s.ssp = sp.id' : 'brave_new.dsp_points dp ON s.dsp = dp.id'}
            LEFT JOIN
                ${type === 'ssp' ? 'brave_new.partners p ON sp.partner_id = p.id' : 'brave_new.partners p ON dp.partner_id = p.id'}
            WHERE
                p.id = ?
                AND s.unixtime >= ?
                AND s.unixtime < ?`;

        if (endpointId === 'all') {
            query += `
            GROUP BY
                p.id
            `
        } else if (endpointId) {
            query += `
            AND
                s.${type} = ?
            `
        }

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);

            const result = await queryAsync(query, [partner_id, dateStart, dateEnd, endpointId]);

            if (result.length > 0) {
                const res = result[0];
                res.spend = this.roundValue(res.spend);
                res.win_rate = this.roundValue(res.win_rate);
                res.gross_point = this.roundValue(res.gross_point);
            }

            return result[0];
        } catch (error) {
            throw new Error(`Error retrieving summary reports: ${error.message} `);
        } finally {
            connection.end();
        }
    },
};

module.exports = SummaryReports;



