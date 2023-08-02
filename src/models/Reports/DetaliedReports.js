const db = require('../../config/db');
const { promisify } = require('util');

const DetaliedReports = {

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
            IF(s.store != 'isweb', s.bundle_domain, '') AS bundle_domain,
            IF(s.store = 'isweb', s.bundle_domain, '') AS site_domain,
            s.source_name AS app_name,
            s.store AS app_bundle,
            s.pub_id AS pub_id,
            s.country AS region,
            s.size AS size,
            s.type AS traffic_type,
            SUM(s.impressions_cnt) AS impressions,
            SUM(s.impressions_${type}_sum) AS spend 
        FROM 
            brave_source_statistic.\`08-2023\` AS s
        LEFT JOIN 
            ${type === 'ssp' ? 'brave_new.ssp_points sp ON s.ssp = sp.id' : 'brave_new.dsp_points dp ON s.dsp = dp.id'}
        LEFT JOIN 
            ${type === 'ssp' ? 'brave_new.partners p ON sp.partner_id = p.id' : 'brave_new.partners p ON dp.partner_id = p.id'}
        WHERE 
            p.id = ?
            AND s.unixtime >= ?
            AND s.unixtime < ?`;


        return query
    },

    fetchDetReports: async function (partner_id, type, period, startDate, endDate, displayBy, endPointUrl, size, trafficType, platform, region) {
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
            const lastWeekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6, 23, 59, 59);
            dateStart = Math.floor(lastWeekStart.getTime() / 1000);
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else if (period === 'lastmonth') {
            const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
            const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);
            dateEnd = Math.floor(lastMonthEnd.getTime() / 1000);

            const lastMonthStart = new Date(lastMonthEnd);
            lastMonthStart.setDate(1);
            dateStart = Math.floor(lastMonthStart.getTime() / 1000);
        } else if (period === 'thismonth') {
            const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
            dateStart = Math.floor(thisMonthStart.getTime() / 1000);
            dateEnd = Math.floor(currentDate.getTime() / 1000);
        } else {
            dateStart = Math.floor(new Date(startDate).setHours(0, 0, 0, 0) / 1000);
            dateEnd = Math.floor(new Date(endDate).setHours(23, 59, 59, 999) / 1000);
        }

        query = this.generateQuery(displayBy, type);

        let params = [partner_id, dateStart, dateEnd];

        if (endPointUrl && endPointUrl !== 'all') {
            query += ` AND s.${type} = ?`;
            params.push(endPointUrl);
        }

        if (size && size !== 'allSize') {
            query += ` AND s.size = ?`;
            params.push(size);
        }

        if (trafficType && trafficType !== 'allTypes') {
            query += ` AND s.type = ?`;
            params.push(trafficType);
        }
        const connection = db.createConnection();

        try {
            console.log('query:', query);
            const queryAsync = promisify(connection.query).bind(connection);

            const result = await queryAsync(query, params);

            console.log('result:', result);
            if (result.length > 0) {
                const resultData = result.map((row) => ({
                    spend: this.roundValue(row.spend),
                    impressions: this.roundValue(row.impressions),
                    app_name: row.app_name,
                    app_bundle: row.app_bundle,
                    pub_id: row.pub_id,
                    region: row.region,
                    size: row.size,
                    traffic_type: row.traffic_type,
                    bundle_domain: row.bundle_domain,
                    site_domain: row.site_domain,
                    time_interval: row.time_interval
                }));

                if (resultData.length > 0) {
                    const detaliedReportsDto = {
                        spend: resultData.map((data) => data.spend),
                        impressions: resultData.map((data) => data.impressions),
                        app_name: resultData.map((data) => data.app_name),
                        app_bundle: resultData.map((data) => data.app_bundle),
                        pub_id: resultData.map((data) => data.pub_id),
                        region: resultData.map((data) => data.region),
                        size: resultData.map((data) => data.size),
                        traffic_type: resultData.map((data) => data.traffic_type),
                        time_interval: resultData.map((data) => data.time_interval),
                        bundle_domain: resultData.map((data) => data.bundle_domain),
                        site_domain: resultData.map((data) => data.site_domain),
                        labels: ['Spend', 'Region', 'Impressions'],
                        isChecked: ['true', 'true', 'true']
                    };
                    console.log('Результат в модели detaliedReportsDto:', detaliedReportsDto);
                    return detaliedReportsDto;
                } else {
                    // Handle the case when there is no data available
                    throw new Error('No data found.');
                }
            } else {
                // Handle the case when there is no data available
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
