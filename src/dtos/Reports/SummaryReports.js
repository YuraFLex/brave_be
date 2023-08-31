module.exports = class SummaryReportsDto {
    timeOut;
    t_outs;
    impress;
    req;
    resp;
    spending;
    w_rate;
    t_interval;
    total;

    constructor(model) {
        this.timeOut = model.timeouts;
        this.t_outs = model.time_outs;
        this.impress = model.impressions;
        this.req = model.requests;
        this.resp = model.responses;
        this.spending = model.spend;
        this.w_rate = model.win_rate;
        this.t_interval = model.time_interval;
        this.total = model.total;
    }
}