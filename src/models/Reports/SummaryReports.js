const db = require('../../config/db');
const { promisify } = require('util');

const SummaryReports = {
    roundValue(value) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            const roundedValue = Math.round(parsedValue * 100) / 100;
            const formattedValue = roundedValue.toFixed(2);

            const [integerPart, decimalPart] = formattedValue.split('.');

            if (decimalPart === '00') {
                return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {

                const integerWithSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return `${integerWithSeparators}.${decimalPart}`;
            }
        }
        return value;
    },

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

        const currentDate = new Date();

        if (period === 'today') {
            dateStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0).getTime() / 1000;
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else if (period === 'yesterday') {
            const yesterday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 0, 0, 0);
            dateStart = Math.floor(yesterday.getTime() / 1000);
            dateEnd = Math.floor(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 23, 59, 59).getTime() / 1000);
        } else if (period === 'lastweek') {
            const lastWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7, 0, 0, 0);
            dateStart = Math.floor(lastWeekStart.getTime() / 1000);
            dateEnd = Math.floor(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 23, 59, 59).getTime() / 1000);
        } else if (period === 'lastmonth') {
            const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 0, 0, 0);
            dateStart = Math.floor(lastMonthStart.getTime() / 1000);

            const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
            const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);
            dateEnd = Math.floor(lastMonthEnd.getTime() / 1000);
        } else if (period === 'thismonth') {
            const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
            dateStart = Math.floor(thisMonthStart.getTime() / 1000);
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else {
            dateStart = Math.floor(new Date(startDate).setHours(0, 0, 0, 0) / 1000);
            dateEnd = Math.floor(new Date(endDate).setHours(23, 59, 59, 999) / 1000);
        }

        query = this.generateQuery(displayBy, type);

        if (endPointUrl === 'all') {
            query += `
                GROUP BY
                    time_interval,
                    p.id`;
        } else if (endPointUrl) {
            query += `
                AND
                s.${type} = ?`;
        }

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);

            const result = await queryAsync(query, [partner_id, dateStart, dateEnd, endPointUrl]);

            if (result.length > 0) {
                const resultData = result.map((row) => ({
                    timeouts: this.roundValue(row.timeouts),
                    time_outs: this.roundValue(row.time_outs),
                    impressions: this.roundValue(row.impressions),
                    requests: this.roundValue(row.requests),
                    responses: this.roundValue(row.responses),
                    spend: this.roundValue(row.spend),
                    win_rate: this.roundValue(row.win_rate),
                    time_interval: row.time_interval,
                }));

                console.log('Результат в модели:', resultData);

                const summaryReportsDto = {
                    timeouts: resultData.map((data) => data.timeouts),
                    time_outs: resultData.map((data) => data.time_outs),
                    impressions: resultData.map((data) => data.impressions),
                    requests: resultData.map((data) => data.requests),
                    responses: resultData.map((data) => data.responses),
                    spend: resultData.map((data) => data.spend),
                    win_rate: resultData.map((data) => data.win_rate),
                    time_interval: resultData.map((data) => data.time_interval),
                    labels: ['Spend', 'Impressions', 'Requests'],
                    isChecked: ['true', 'true', 'true']
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
                    gross_point: [],
                    time_interval: [],
                    labels: [],
                    isChecked: []
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



