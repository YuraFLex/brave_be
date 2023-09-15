module.exports = class ChartDto {
    today;
    yesterday;
    lastweek;

    constructor(model) {
        this.today = model.today;
        this.yesterday = model.yesterday;
        this.lastweek = model.lastweek;
    }
}