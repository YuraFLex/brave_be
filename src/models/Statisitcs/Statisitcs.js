const { log } = require("console");
const db = require("../../config/db");
const { promisify } = require("util");

const Statistics = {
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

  getStatistics: async function (partner_id, type, startDate, endDate, endPoint, period) {
    type = type.toLowerCase();
    let query;
    let queryParams = [partner_id];

    query = `
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
        ${type === 'ssp' ? 'brave_new.statistic s ON sp.id = s.ssp' : 'brave_new.statistic s ON dp.id = s.dsp'}`;

    query += `
      WHERE
        p.id = ?`;

    if (endDate && startDate) {
      query += `
        AND
          (s.unixtime BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?))`;
      queryParams.push(startDate);
      queryParams.push(endDate);
    } else if (period) {
      const currentDate = new Date();
      let startOfDay, endOfDay;

      switch (period) {
        case 'today':
          startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
          endOfDay = currentDate;
          break;
        case 'yesterday':
          startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 0, 0, 0);
          endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 23, 59, 59);
          break;
        case 'lastweek':
          startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6, 23, 59, 59);
          endOfDay = currentDate;
          break;
        case 'lastmonth':
          const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 0, 0, 0);
          const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);
          startOfDay = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1, 0, 0, 0);
          endOfDay = lastMonthEnd;
          break;
        case 'thismonth':
          startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
          endOfDay = currentDate;
          break;
        default:
          throw new Error("Invalid period");
      }


      query += `
        AND
          (s.unixtime BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?))`;
      queryParams.push(startOfDay);
      queryParams.push(endOfDay);
    } else {
      const currentDate = new Date();
      const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
      const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);

      query += `
        AND
          (s.unixtime BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?))`;
      queryParams.push(startOfDay);
      queryParams.push(endOfDay);
    }

    if (endPoint === 'all') {
      query += `
        GROUP BY
          p.id`;
    } else if (endPoint) {
      query += `
        AND
          (s.${type} = ? OR s.${type} IS NULL)`;
      queryParams.push(endPoint);
    }

    const connection = db.createConnection();

    try {
      const queryAsync = promisify(connection.query).bind(connection);

      const results = await queryAsync(query, queryParams);



      if (results.length > 0) {
        const statistics = results[0];
        statistics.spend = this.roundValue(statistics.spend);
        statistics.impressions_cnt = this.roundValue(statistics.impressions_cnt);
        statistics.responses = this.roundValue(statistics.responses);
        statistics.time_outs = this.roundValue(statistics.time_outs);
        statistics.win_rate = this.roundValue(statistics.win_rate);
      }

      console.log('Result:', results);

      return results[0];
    } catch (error) {
      throw new Error(`Error retrieving statistics: ${error.message}`);
    } finally {
      connection.end();
    }
  },
};

module.exports = Statistics;
