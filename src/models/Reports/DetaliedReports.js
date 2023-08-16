const db = require('../../config/db');
const { promisify } = require('util');
const { roundValue } = require('../../utils')

const DetaliedReports = {

    generateQuery: function (displayBy, type, tableNames, partnerId, startDate, endDate, endPointUrl, size, trafficType) {
        let displayByFormat;

        if (displayBy === 'hour') {
            displayByFormat = `'%H:00'`;
        } else if (displayBy === 'day') {
            displayByFormat = `'%Y/%m/%d'`;
        } else if (displayBy === 'month') {
            displayByFormat = `'%Y/%m'`;
        } else if (displayBy === 'year') {
            displayByFormat = `'%Y'`;
        }

        const subQueries = tableNames.map(tableName => `
            SELECT
                p.id AS partner_id,
                DATE_FORMAT(FROM_UNIXTIME(s.unixtime), ${displayByFormat}) AS time_interval,
                IF(s.store != 'isweb', s.bundle_domain, '') AS bundle_domain,
                IF(s.store = 'isweb', s.bundle_domain, '') AS site_domain, 
                s.source_name AS app_name,
                s.size AS size,
                s.type AS traffic_type,
                SUM(s.impressions_cnt) AS impressions,
                SUM(s.impressions_${type}_sum) AS spend 
            FROM 
                brave_source_statistic.\`${tableName}\` AS s
            LEFT JOIN 
                ${type === 'ssp' ? 'brave_new.ssp_points sp ON s.ssp = sp.id' : 'brave_new.dsp_points dp ON s.dsp = dp.id'}
            LEFT JOIN 
                ${type === 'ssp' ? 'brave_new.partners p ON sp.partner_id = p.id' : 'brave_new.partners p ON dp.partner_id = p.id'}
            WHERE 
                p.id = ?
                AND s.unixtime >= ?
                AND s.unixtime < ?
                ${endPointUrl && endPointUrl !== 'all' ? ` AND s.${type} = '${endPointUrl}'` : ''}
                ${size && size !== 'allSize' ? ` AND s.size = '${size}'` : ''}
                ${trafficType && trafficType !== 'allTypes' ? ` AND s.type = '${trafficType}'` : ''}
            GROUP BY
                time_interval,
                ${type === 'dsp' ? 'dp.id,' : 'sp.id,'}
                s.size,
                s.type
        `);

        const unionAllQuery = subQueries.join(' UNION ALL ');

        return unionAllQuery;
    },


    getTableNameForPeriod: function (period, startDate, endDate) {
        if (period === 'custom') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const startYear = start.getFullYear();
            const startMonth = start.getMonth();
            const endYear = end.getFullYear();
            const endMonth = end.getMonth();

            if (startYear === endYear && startMonth === endMonth) {
                return [`${startMonth.toString().padStart(2, '0')}-${startYear}`];
            } else {
                const tableNames = [];
                let currentDate = new Date(startYear, startMonth, 1);

                while (currentDate <= end) {
                    const currentYear = currentDate.getFullYear();
                    const currentMonth = currentDate.getMonth();
                    tableNames.push(`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`);

                    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                }

                return tableNames;
            }
        } else {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();

            let lastMonth, lastYear;

            if (period === 'lastmonth') {
                lastMonth = currentMonth - 1;
                lastYear = currentYear;
                if (lastMonth === -1) {
                    lastMonth = 11;
                    lastYear = currentYear - 1;
                }
                return [`${(lastMonth + 1).toString().padStart(2, '0')}-${lastYear}`];

            } else if (period === 'today' || period === 'yesterday' || period === 'lastweek') {
                return [`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`];
            } else if (period === 'thismonth') {
                return [`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`];
            } else {
                throw new Error('Invalid period.');
            }
        }
    },




    fetchDetReports: async function (partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType) {
        type = type.toLowerCase();
        let query;
        let dateStart, dateEnd;

        const currentDate = new Date();
        displayBy = displayBy.toLowerCase();

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

        const tableNames = this.getTableNameForPeriod(period, startDate, endDate);
        const tableNameArray = Array.isArray(tableNames) ? tableNames : [tableNames];
        query = this.generateQuery(displayBy, type, tableNameArray, partner_id, startDate, endDate, endPointUrl, size, trafficType);


        let params = [];

        tableNameArray.forEach(tableName => {
            params = params.concat([
                partner_id, dateStart, dateEnd
            ]);
        });

        // console.log('query:', query);

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);
            const result = await queryAsync(query, params);

            if (result.length > 0) {
                let totalSpend = 0;
                let totalImpressions = 0;

                const resultData = result.map((row) => {
                    totalSpend += parseFloat(row.spend);
                    totalImpressions += parseFloat(row.impressions);

                    return {
                        spend: row.spend,
                        impressions: row.impressions,
                        app_name: row.app_name,
                        size: row.size,
                        traffic_type: row.traffic_type,
                        bundle_domain: row.bundle_domain,
                        site_domain: row.site_domain,
                        time_interval: row.time_interval
                    };
                });

                const detaliedReportsDto = {
                    spend: resultData.map((data) => data.spend),
                    impressions: resultData.map((data) => data.impressions),
                    app_name: resultData.map((data) => data.app_name),
                    size: resultData.map((data) => data.size),
                    traffic_type: resultData.map((data) => data.traffic_type),
                    time_interval: resultData.map((data) => data.time_interval),
                    bundle_domain: resultData.map((data) => data.bundle_domain),
                    site_domain: resultData.map((data) => data.site_domain),
                    labels: ['Spend', 'Region', 'Impressions'],
                    isChecked: ['true', 'true', 'true'],
                    total: {
                        spend: roundValue(totalSpend),
                        impressions: roundValue(totalImpressions),
                    }
                };

                console.log('Результат в модели detaliedReportsDto:', detaliedReportsDto);
                return detaliedReportsDto;
            } else {
                throw new Error('No data found.');
            }
        } catch (error) {
            throw new Error(`Error retrieving detailed reports: ${error.message}`);
        } finally {
            connection.end();
        }

    },

    fetchSizesList: async function (partnerId, type) {

        type = type.toLowerCase();

        let query = `
                SELECT DISTINCT
        cusl.size AS size
        FROM
        brave_new.cache_uniq_sizesdsp_list cusl
                LEFT JOIN
        brave_new.dsp_points dp ON cusl.dsp_id = dp.id
                LEFT JOIN
        brave_new.partners p ON dp.partner_id = p.id
        WHERE
        p.id = 313 `

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection);
            const result = await queryAsync(query, [partnerId]);

            return result;

        } catch (error) {
            console.log(error);
        } finally {
            connection.end()
        }
    }

};

module.exports = DetaliedReports;