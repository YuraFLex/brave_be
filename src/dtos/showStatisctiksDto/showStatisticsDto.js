module.exports = class StatisticsDto {
    spend;
    impressions_cnt;
    responses;
    time_outs;
    win_rate;

    constructor(model) {
        this.spend = model.spend;
        this.impressions_cnt = model.impressions_cnt;
        this.responses = model.responses;
        this.time_outs = model.time_outs;
        this.win_rate = model.win_rate;
    }
}

