const db = require("../../config/db");
const { promisify } = require("util");
const { roundValue } = require('../../utils/index');

const Statistics = {

  generateQuery: function (type, endPoint) {

    let query = `
      SELECT
          p.id AS partner_id,
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
          p.id`;

    return query;
  },

  fetchStatistics: async function (partner_id, type, startDate, endDate, endPoint, period) {
    type = type.toLowerCase();
    let query;
    let dateStart, dateEnd;

    const currentDate = new Date();

    if (period === 'custom') {
      if (typeof startDate === 'string') {
        startDate = new Date(startDate);
      }
      if (typeof endDate === 'string') {
        endDate = new Date(endDate);
      }
      dateStart = Math.floor(startDate.getTime() / 1000);
      dateEnd = Math.floor(endDate.getTime() / 1000);
    } else if (period === 'today') {
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

    query = this.generateQuery(type, endPoint);

    let params = [partner_id, dateStart, dateEnd]

    const connection = db.createConnection();

    try {
      const queryAsync = promisify(connection.query).bind(connection)

      const result = await queryAsync(query, params)

      if (result.length > 0) {
        const statistics = result[0];
        statistics.spend = roundValue(statistics.spend);
        statistics.impressions_cnt = roundValue(statistics.impressions_cnt);
        statistics.responses = roundValue(statistics.responses);
        statistics.time_outs = roundValue(statistics.time_outs);
        statistics.win_rate = roundValue(statistics.win_rate);
      }

      return result[0];

    } catch (error) {
      throw new Error(`Error retrieving statistics: ${error.message}`);
    } finally {
      connection.end()
    }
  },
};

module.exports = Statistics;
