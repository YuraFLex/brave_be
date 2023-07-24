class DownloadCsvService {
    async createCsvFile(data) {
        console.log('Данные в сервисе:', data);

        const { items, time_interval } = data;
        const header = `Date | ${items.map(item => item.label).join(' | ')}\n`;

        let csv = '';
        for (let index = 0; index < time_interval.length; index++) {
            const rowData = items.map(item => {
                const value = item.data[index];
                return value !== undefined ? value : '';
            });
            csv += `${time_interval[index]} | ${rowData.join(' | ')}\n`;
        }

        csv = header + csv;

        console.log('CSV:', csv);

        const filename = 'summary_reports.csv';
        return { csv, filename };
    }
}

module.exports = new DownloadCsvService();
