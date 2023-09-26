module.exports = class ChartDto {
    spending;
    impress;
    resp;
    t_outs;
    w_rate;
    t_interval;

    constructor(model) {
        this.spending = model.spending;
        this.impress = model.impress;
        this.resp = model.resp;
        this.t_outs = model.t_outs;
        this.w_rate = model.w_rate;
        this.t_interval = model.t_interval;
    }
}