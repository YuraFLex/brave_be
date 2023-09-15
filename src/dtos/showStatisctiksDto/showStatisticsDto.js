module.exports = class StatisticsDto {
    spending;
    impress;
    resp;
    t_outs;
    w_rate;

    constructor(model) {
        this.spending = model.spend;
        this.impress = model.impressions_cnt;
        this.resp = model.responses;
        this.t_outs = model.time_outs;
        this.w_rate = model.win_rate;
    }
}

