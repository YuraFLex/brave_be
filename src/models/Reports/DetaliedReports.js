const db = require('../../config/db');
const { promisify } = require('util')


const DetaliedReports = {

    roundValue(value) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            const roundedValue = Math.round(parsedValue * 100) / 100;
            const formattedValue = roundedValue.toFixed(2);

            // Разделяем целую и дробную часть значения точкой
            const [integerPart, decimalPart] = formattedValue.split('.');

            if (decimalPart === '00') {
                // Если дробная часть равна "00", возвращаем только целую часть значения
                return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            } else {
                // Иначе, добавляем разделитель точки каждые три символа слева от десятичной точки
                const integerWithSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return `${integerWithSeparators},${decimalPart}`;
            }
        }
        return value;
    },

    fetchDetReports: async function (partner_id, type, period, startDate, endDate, displayBy, size, traffictype, platform, region,) {
        type = type.toLowerCase()
        let query;
        let dateStart, dateEnd;

        const currentDate = new Date()

        query = `
        SELECT 
            s.source_name AS app_name,
            s.store AS app_bundle ,
            s.pub_id AS pub_id,
            s.dsp_source_id AS dspSource_id,
            s.source_id AS source_id,
            s.country AS region,
            s.size AS size,
            s.type AS traffic_type,
            SUM(s.impressions_cnt) AS impressions,
            SUM(s.impressions_${type}_sum) AS spend 
        FROM 
            brave_source_statistic.\`07-2023\` AS s
        LEFT JOIN 
            brave_new.dsp_points dp ON s.dsp = dp.id
        LEFT JOIN 
            brave_new.partners p ON dp.partner_id = p.id
        WHERE p.id = 313`;

        const connection = db.createConnection();

        try {
            const queryAsync = promisify(connection.query).bind(connection)

            const result = await queryAsync(query, [partner_id, dateStart, dateEnd])

            if (result.length > 0) {
                const detalied = result[0];
                detalied.spend = this.roundValue(detalied.spend)
                detalied.impressions = this.roundValue(detalied.impressions)
            }

            console.log('Результат в модели:', result);
            return result[0]

        } catch (error) {
            throw new Error(`Error retrieving detalied reports: ${error.message} `);
        } finally {
            connection.end();
        }
    }


}

module.exports = DetaliedReports;


