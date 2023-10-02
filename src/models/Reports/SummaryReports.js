const db = require('../../config/db');
const { promisify } = require('util');
const { roundValue, getDateRange } = require('../../utils')

const SummaryReports = {

    generateQuery: function (displayBy, type, endPointUrl) {
        let query = `
            SELECT
                p.id AS partner_id,
                DATE_FORMAT(FROM_UNIXTIME(s.unixtime), `;

        if (displayBy === 'hour') {
            query += `'%H:00'`;
        } else if (displayBy === 'day') {
            query += `'%Y/%m/%d'`;
        } else if (displayBy === 'month') {
            query += `'%Y/%m'`;
        } else if (displayBy === 'year') {
            query += `'%Y'`;
        }

        query += `) AS time_interval,
            SUM(s.timeouts_cnt) AS timeouts,
            SUM(s.timeouts_cnt)/(SUM(requests_cnt)/100) AS time_outs,
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
            AND s.unixtime < ?
            ${endPointUrl && endPointUrl !== 'all' ? `AND s.${type} = '${endPointUrl}'` : ''}
        GROUP BY
            time_interval`;

        return query;
    },

    fetchSumReports: async function (partner_id, type, displayBy, endPointUrl, period, startDate, endDate) {
        type = type.toLowerCase();
        let query;
        const { dateStart, dateEnd } = getDateRange(period, startDate, endDate);

        query = this.generateQuery(displayBy, type, endPointUrl);

        let params = [partner_id, dateStart, dateEnd]

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);

            const result = await queryAsync(query, params)

            if (result.length > 0) {
                let totalTimeOuts = 0;
                let totalTime_Outs = 0;
                let totalImpressions = 0;
                let totalRequests = 0;
                let totalResponses = 0;
                let totalSpend = 0;
                let totalWinRate = 0;

                const resultData = result.map((row) => {

                    totalTimeOuts += parseFloat(row.timeouts);
                    totalTime_Outs += parseFloat(row.time_outs);
                    totalImpressions += parseFloat(row.impressions);
                    totalRequests += parseFloat(row.requests);
                    totalResponses += parseFloat(row.responses);
                    totalSpend += parseFloat(row.spend);
                    totalWinRate += parseFloat(row.win_rate);

                    return {
                        timeouts: roundValue(row.timeouts),
                        time_outs: roundValue(row.time_outs),
                        impressions: roundValue(row.impressions),
                        requests: roundValue(row.requests),
                        responses: roundValue(row.responses),
                        spend: roundValue(row.spend),
                        win_rate: roundValue(row.win_rate),
                        time_interval: row.time_interval,
                    }
                });

                const summaryReportsDto = {
                    timeouts: resultData.map((data) => data.timeouts),
                    time_outs: resultData.map((data) => data.time_outs),
                    impressions: resultData.map((data) => data.impressions),
                    requests: resultData.map((data) => data.requests),
                    responses: resultData.map((data) => data.responses),
                    spend: resultData.map((data) => data.spend),
                    win_rate: resultData.map((data) => data.win_rate),
                    time_interval: resultData.map((data) => data.time_interval),
                    total: {
                        timeOut: roundValue(totalTimeOuts),
                        t_outs: roundValue(totalTime_Outs),
                        impress: roundValue(totalImpressions),
                        req: roundValue(totalRequests),
                        resp: roundValue(totalResponses),
                        spending: roundValue(totalSpend),
                        w_rate: roundValue(totalWinRate)
                    }
                };

                return summaryReportsDto;
            } else {
                console.log('Результат в модели: Пусто');
                return {
                    timeouts: [],
                    time_outs: [],
                    impressions: [],
                    requests: [],
                    responses: [],
                    spend: [],
                    win_rate: [],
                    time_interval: [],
                };
            }
        } catch (error) {
            throw new Error(`Error retrieving summary reports: ${error.message}`);
        } finally {
            connection.end();
        }
    },
};

module.exports = SummaryReports;