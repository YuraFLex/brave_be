const utils = {
    roundValue(value) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            const roundedValue = Math.round(parsedValue * 100) / 100;
            return roundedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        }
        return value;
    },

    calculateDateRange(period, startDate, endDate) {
        const currentDate = new Date();
        let dateStart, dateEnd;

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

        return { dateStart, dateEnd };
    }
}

module.exports = utils;

