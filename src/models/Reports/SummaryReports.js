const db = require('../../config/db');
const { promisify } = require('util');
const { roundValue } = require('../../utils')

const SummaryReports = {

    generateQuery: function (displayBy, type) {
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
            AND s.unixtime < ?`;

        return query;
    },

    fetchSumReports: async function (partner_id, type, displayBy, endPointUrl, period, startDate, endDate) {
        type = type.toLowerCase();
        let query;
        let dateStart, dateEnd;

        console.log('period:', period);

        const currentDate = new Date();

        if (period === 'today') {
            dateStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), 0, 0, 0)).getTime() / 1000;
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else if (period === 'yesterday') {
            const yesterday = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - 1, 0, 0, 0));
            dateStart = Math.floor(yesterday.getTime() / 1000);
            dateEnd = Math.floor(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - 1, 23, 59, 59)).getTime() / 1000);
        } else if (period === 'lastweek') {
            const lastWeekStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - 7, 0, 0, 0));
            dateStart = Math.floor(lastWeekStart.getTime() / 1000);
            dateEnd = Math.floor(new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - 1, 23, 59, 59)).getTime() / 1000);
        } else if (period === 'lastmonth') {
            const lastMonthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1, 0, 0, 0));
            dateStart = Math.floor(lastMonthStart.getTime() / 1000);

            const thisMonthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1, 0, 0, 0));
            const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);
            dateEnd = Math.floor(lastMonthEnd.getTime() / 1000);
        } else if (period === 'thismonth') {
            const thisMonthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1, 0, 0, 0));
            dateStart = Math.floor(thisMonthStart.getTime() / 1000);
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else {
            dateStart = Math.floor(new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0)).getTime() / 1000);
            dateEnd = Math.floor(new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999)).getTime() / 1000);
        }

        query = this.generateQuery(displayBy, type);

        let params = [partner_id, dateStart, dateEnd]

        if (endPointUrl && endPointUrl !== 'all') {
            query += ` AND s.${type} = ?`;
            params.push(endPointUrl);
        }

        query += `
            GROUP BY
                time_interval`;

        // console.log('query:', query);
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

                // console.log('Результат в модели:', resultData);

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



