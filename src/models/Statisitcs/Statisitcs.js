const db = require("../../config/db");
const { promisify } = require("util");

const Statistics = {
  roundValue(value) {
    if (typeof value === 'number') {
      const roundedValue = Math.round(value * 100) / 100;
      return roundedValue.toFixed(2);
    }
    return value;
  },

  getStatistics: async function (partner_id, type, startDate, endDate, endPoint, period) {
    let query;
    let queryParams = [partner_id];

    console.log('период в модели:', period);

    if (type === "SSP") {
      query = `
        SELECT
          p.id AS partner_id,
          SUM(s.bids_ssp_cnt) AS bids_ssp_cnt,
          SUM(s.impressions_ssp_sum) AS impressions_ssp_sum,
          SUM(s.bids_ssp_sum) AS bids_ssp_sum,
          SUM(s.impressions_cnt) AS impressions_cnt
        FROM
          brave_new.partners p
        LEFT JOIN
          brave_new.ssp_points sp ON p.id = sp.partner_id
        LEFT JOIN
          brave_new.statistic s ON sp.id = s.ssp`;
    } else if (type === "DSP") {
      query = `
        SELECT
          p.id AS partner_id,
          SUM(s.bids_dsp_cnt) AS bids_dsp_cnt,
          SUM(s.impressions_dsp_sum) AS impressions_dsp_sum,
          SUM(s.bids_dsp_sum) AS bids_dsp_sum,
          SUM(s.impressions_cnt) AS impressions_cnt
        FROM
          brave_new.partners p
        LEFT JOIN
          brave_new.dsp_points dp ON p.id = dp.partner_id
        LEFT JOIN
          brave_new.statistic s ON dp.id = s.dsp`;
    } else {
      throw new Error("Invalid partner type");
    }

    query += `
      WHERE
        p.id = ?`;

    if (endDate && startDate) {
      query += `
        AND
          (s.unixtime BETWEEN ? AND ? OR s.unixtime IS NULL)`;
      queryParams.push(startDate);
      queryParams.push(endDate);
    } else if (period) {
      query += `
        AND
          (s.unixtime >= ? OR s.unixtime IS NULL)
        AND
          (s.unixtime < UNIX_TIMESTAMP(CURRENT_DATE() + INTERVAL 1 DAY) OR s.unixtime IS NULL)`;
      queryParams.push(period);
    } else {
      query += `
        AND
          (s.unixtime >= UNIX_TIMESTAMP(CURRENT_DATE()) OR s.unixtime IS NULL)
        AND
          (s.unixtime < UNIX_TIMESTAMP(CURRENT_DATE() + INTERVAL 1 DAY) OR s.unixtime IS NULL)`;
    }

    if (endPoint === 'all') {
      query += `
        GROUP BY
          p.id`;
    } else if (endPoint) {
      query += `
        AND
          (s.${type.toLowerCase()} = ? OR s.${type.toLowerCase()} IS NULL)`;
      queryParams.push(endPoint);
    }

    const connection = db.createConnection();

    try {
      const queryAsync = promisify(connection.query).bind(connection);

      const results = await queryAsync(query, queryParams);
      console.log('Результат:', results);

      if (results.length > 0) {
        const statistics = results[0];
        statistics.impressions_dsp_sum = this.roundValue(statistics.impressions_dsp_sum);
        statistics.bids_dsp_sum = this.roundValue(statistics.bids_dsp_sum);
        statistics.impressions_ssp_sum = this.roundValue(statistics.impressions_ssp_sum);
        statistics.bids_ssp_sum = this.roundValue(statistics.bids_ssp_sum);
        statistics.impressions_cnt = this.roundValue(statistics.impressions_cnt);
      }

      return results[0];
    } catch (error) {
      throw new Error(`Error retrieving statistics: ${error.message}`);
    } finally {
      connection.end();
    }
  },
};

module.exports = Statistics;
