module.exports = class StatisticsDto {
    spends;
    imp_cnt;
    resp;
    t_outs;
    w_rate;

    constructor(model) {
        this.spends = model.spend;
        this.imp_cnt = model.impressions_cnt;
        this.resp = model.responses;
        this.t_outs = model.time_outs;
        this.w_rate = model.win_rate;
    }
}

