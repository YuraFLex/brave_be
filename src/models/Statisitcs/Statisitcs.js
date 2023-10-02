const db = require("../../config/db");
const { promisify } = require("util");
const { roundValue, getDateRange } = require('../../utils/index');

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

    const { dateStart, dateEnd } = getDateRange(period, startDate, endDate);

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
