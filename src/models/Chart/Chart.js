const db = require('../../config/db');
const { promisify } = require('util');
const { getDateRange } = require('../../utils');

const Chart = {

    generateQuery: function (type, endPoint, period, startDate, endDate) {
        const currentDate = new Date();
        const currentMonth = currentDate.getUTCMonth();
        const thisMonth = new Date(currentDate);
        thisMonth.setUTCMonth(currentMonth + 1);

        const isFirstDayOfMonth = thisMonth.getUTCDate() === 1;

        const timeFormat =
            period === 'today' || period === 'yesterday' || (period === 'thismonth' && isFirstDayOfMonth) || (period === 'custom' && startDate === endDate)
                ? `'%H:00'`
                : `'%Y/%m/%d'`;

        let query = `
          SELECT
              p.id AS partner_id,
              DATE_FORMAT(FROM_UNIXTIME(s.unixtime), ${timeFormat}) AS time_interval,
              SUM(s.impressions_${type}_sum) AS spend,
              SUM(s.impressions_cnt) AS impressions_cnt,
              SUM(s.bids_${type}_cnt) AS responses,
              SUM(s.timeouts_cnt)/(SUM(requests_cnt)/100) AS time_outs,
              SUM(s.impressions_cnt)/SUM(s.bids_${type}_cnt)*100 AS win_rate
          FROM
              brave_new.partners p
          LEFT JOIN
              ${type === 'ssp' ? 'brave_new.ssp_points sp ON p.id = sp.partner_id' : 'brave_new.dsp_points dp ON p.id = dp.partner_id'}
          LEFT JOIN
              ${type === 'ssp' ? 'brave_new.statistic s ON sp.id = s.ssp' : 'brave_new.statistic s ON dp.id = s.dsp'}
          WHERE
              p.id = ?
              AND s.unixtime >= ?
              AND s.unixtime < ?
              ${endPoint && endPoint !== 'all' ? `AND s.${type} = '${endPoint}'` : ''}
          GROUP BY
            p.id,
            time_interval`;

        return query;
    },

    fetchChartData: async function (partnerId, type, period, endPoint, startDate, endDate) {
        type = type.toLowerCase();
        let resultData = {};
        let query;
        const { dateStart, dateEnd } = getDateRange(period, startDate, endDate);

        query = this.generateQuery(type, endPoint, period, startDate, endDate);

        let params = [partnerId, dateStart, dateEnd];

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);

            const result = await queryAsync(query, params);

            resultData = {
                spending: result.map(row => row.spend),
                impress: result.map(row => row.impressions_cnt),
                resp: result.map(row => row.responses),
                t_outs: result.map(row => row.time_outs),
                w_rate: result.map(row => row.win_rate),
                t_interval: result.map(row => row.time_interval),
            };
            // console.log('resultData:', resultData);

            return resultData;
        } catch (error) {
            throw new Error(`Error retrieving statistics: ${error.message}`);
        } finally {
            connection.end();
        }
    }



}

module.exports = Chart;