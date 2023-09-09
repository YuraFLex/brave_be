const db = require('../../config/db');
const { promisify } = require('util');
const { roundValue } = require('../../utils')

const DetaliedReports = {

    generateQuery: function (displayBy, type, tableNames, partnerId, startDate, endDate, endPointUrl, size, trafficType, groupBy) {
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

        const groupByClauses = groupBy.map(group => {
            if (group === 'default') {
                return 'time_interval'
            } else if (group === 'appBundle') {
                return 'bundle_domain';
            } else if (group === 'appName') {
                return 'app_name';
            } else if (group === 'size') {
                return 'size';
            } else if (group === 'trafficType') {
                return 'traffic_type';
            }
        });

        const selectClauses = groupBy.map(group => {
            if (group === 'default') {
                return ''
            } else if (group === 'appBundle') {
                return `IF(s.store != 'isweb', s.bundle_domain, '') AS bundle_domain,
                IF(s.store = 'isweb', s.bundle_domain, '') AS site_domain,`;
            } else if (group === 'appName') {
                return 's.source_name AS app_name,';
            } else if (group === 'size') {
                return 's.size AS size,';
            } else if (group === 'trafficType') {
                return 's.type AS traffic_type,';
            }
        });

        const subQueries = tableNames.map(tableName => `
            SELECT
                p.id AS partner_id,
                DATE_FORMAT(FROM_UNIXTIME(s.unixtime), ${displayByFormat}) AS time_interval,
                ${selectClauses.join(' ')}
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
                ${groupByClauses.join(', ')}
                
        `);

        const unionAllQuery = subQueries.join(' UNION ALL ');

        return unionAllQuery;
    },

    getTableNameForPeriod: function (period, startDate, endDate) {
        if (period === 'custom') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const startYear = start.getUTCFullYear();
            const startMonth = start.getUTCMonth();
            const endYear = end.getUTCFullYear();
            const endMonth = end.getUTCMonth();

            if (startYear === endYear && startMonth === endMonth) {
                return [`${(startMonth + 1).toString().padStart(2, '0')}-${startYear}`];
            } else {
                const tableNames = [];
                let currentDate = new Date(startYear, startMonth, 1);

                while (currentDate <= end) {
                    const currentYear = currentDate.getUTCFullYear();
                    const currentMonth = currentDate.getUTCMonth();
                    tableNames.push(`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`);

                    currentDate = new Date(currentYear, currentMonth + 1, 1);
                }

                return tableNames;
            }
        } else {
            const currentDate = new Date();
            const currentYear = currentDate.getUTCFullYear();
            const currentMonth = currentDate.getUTCMonth();
            const currentDay = currentDate.getUTCDate();

            let lastMonth, lastYear;
            let tableNames = [];

            if (period === 'lastmonth') {
                lastMonth = currentMonth - 1;
                lastYear = currentYear;
                if (lastMonth === -1) {
                    lastMonth = 11;
                    lastYear = currentYear - 1;
                }
                tableNames.push(`${(lastMonth + 1).toString().padStart(2, '0')}-${lastYear}`);
            } else if (period === 'today') {
                tableNames.push(`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`);
            } else if (period === 'yesterday') {
                if (currentDay === 1) {
                    lastMonth = currentMonth - 1;
                    lastYear = currentYear;
                    if (lastMonth === -1) {
                        lastMonth = 11;
                        lastYear = currentYear - 1;
                    }
                    tableNames.push(`${(lastMonth + 1).toString().padStart(2, '0')}-${lastYear}`);
                } else {
                    tableNames.push(`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`);
                }
            } else if (period === 'lastweek') {
                const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getUTCDate();
                const daysFromPreviousMonth = 7 - currentDay;

                if (daysFromPreviousMonth >= 7) {

                    tableNames.push(`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`);
                } else {

                    tableNames.push(`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`);
                    lastMonth = currentMonth - 1;
                    lastYear = currentYear;
                    if (lastMonth === -1) {
                        lastMonth = 11;
                        lastYear = currentYear - 1;
                    }
                    tableNames.push(`${(lastMonth + 1).toString().padStart(2, '0')}-${lastYear}`);
                }
            } else if (period === 'thismonth') {
                tableNames.push(`${(currentMonth + 1).toString().padStart(2, '0')}-${currentYear}`);
            } else {
                throw new Error('Invalid period.');
            }

            return tableNames;
        }
    },

    fetchDetReports: async function (partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, groupBy) {
        type = type.toLowerCase();
        let query;
        let dateStart, dateEnd;

        const currentDate = new Date();
        displayBy = displayBy.toLowerCase();

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
            dateStart = Math.floor(new Date(startDate).setHours(0, 0, 0, 0) / 1000);
            dateEnd = Math.floor(new Date(endDate).setHours(23, 59, 59, 999) / 1000);
        }

        const tableNames = this.getTableNameForPeriod(period, startDate, endDate);
        const tableNameArray = Array.isArray(tableNames) ? tableNames : [tableNames];
        query = this.generateQuery(displayBy, type, tableNameArray, partner_id, startDate, endDate, endPointUrl, size, trafficType, groupBy);


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

                    const bundleDomain = row.bundle_domain === '' ? row.site_domain : row.bundle_domain;

                    totalSpend += parseFloat(row.spend);
                    totalImpressions += parseFloat(row.impressions);

                    return {
                        spend: roundValue(row.spend),
                        impressions: roundValue(row.impressions),
                        app_name: row.app_name,
                        size: row.size,
                        traffic_type: row.traffic_type,
                        bundle_domain: bundleDomain,
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
                    total: {
                        spending: roundValue(totalSpend),
                        impress: roundValue(totalImpressions),
                    }
                };

                // console.log('Результат в модели detaliedReportsDto:', detaliedReportsDto);
                return detaliedReportsDto;
            } else {
                console.log('Результат в модели: Пусто');
                return {
                    spend: [],
                    impressions: [],
                    app_name: [],
                    size: [],
                    traffic_type: [],
                    time_interval: [],
                    bundle_domain: [],
                    site_domain: [],
                }
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
            SELECT 
                s.size AS size
            FROM
                brave_source_statistic.\`08-2023\` AS s
            LEFT JOIN 
                ${type === 'ssp' ? 'brave_new.ssp_points sp ON s.ssp = sp.id' : 'brave_new.dsp_points dp ON s.dsp = dp.id'}
            LEFT JOIN 
                ${type === 'ssp' ? 'brave_new.partners p ON sp.partner_id = p.id' : 'brave_new.partners p ON dp.partner_id = p.id'}
            WHERE 
                p.id = ?
            GROUP BY
                s.size`;

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