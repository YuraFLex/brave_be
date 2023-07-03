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

  getStatistics: async function (partner_id, type, startDate, endDate, endPoint) {
    let query;

    if (type === "SSP") {
      query = `
        SELECT
          p.id AS partner_id,
          SUM(s.bids_ssp_cnt) AS bids_ssp_cnt,
          SUM(s.impressions_ssp_sum) AS impressions_ssp_sum,
          SUM(s.bids_ssp_sum) AS bids_ssp_sum,
          SUM(s.impressions_cnt) AS impressions_cnt
        FROM
          brave_new.statistic s
        INNER JOIN
          brave_new.ssp_points sp ON s.ssp = sp.id
        INNER JOIN
          brave_new.partners p ON sp.partner_id = p.id
        WHERE
          p.id = ?`;
    } else if (type === "DSP") {
      query = `
        SELECT
          p.id AS partner_id,
          SUM(s.bids_dsp_cnt) AS bids_dsp_cnt,
          SUM(s.impressions_dsp_sum) AS impressions_dsp_sum,
          SUM(s.bids_dsp_sum) AS bids_dsp_sum,
          SUM(s.impressions_cnt) AS impressions_cnt
        FROM
          brave_new.statistic s
        INNER JOIN
          brave_new.dsp_points dp ON s.dsp = dp.id
        INNER JOIN
          brave_new.partners p ON dp.partner_id = p.id
        WHERE
          p.id = ?`;
    } else {
      throw new Error("Invalid partner type");
    }

    if (endPoint === 'all') {
      query += `
        GROUP BY
          p.id`;
    } else if (endPoint) {
      query += `
        AND
          s.${type.toLowerCase()} = ?`;
    }

    if (startDate && endDate) {
      query += `
        AND
          s.unixtime BETWEEN ? AND ?`;
    }

    const connection = db.createConnection();

    try {
      const queryAsync = promisify(connection.query).bind(connection);
      let queryParams = [partner_id];

      if (endPoint && endPoint !== 'all') {
        queryParams.push(endPoint);
      }

      if (startDate && endDate) {
        queryParams.push(startDate);
        queryParams.push(endDate);
      }

      const results = await queryAsync(query, queryParams);
      console.log('Результат:', results);

      if (results.length > 0) {
        const statistics = results[0];
        statistics.impressions_dsp_sum = this.roundValue(statistics.impressions_dsp_sum);
        statistics.bids_dsp_sum = this.roundValue(statistics.bids_dsp_sum);
        statistics.impressions_ssp_sum = this.roundValue(statistics.impressions_ssp_sum);
        statistics.bids_ssp_sum = this.roundValue(statistics.bids_ssp_sum);
        statistics.impressions_cnt = this.roundValue(statistics.impressions_cnt)
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