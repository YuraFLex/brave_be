module.exports = class DetaliedReportsDto {
    spending;
    impress;
    appName;
    sizes;
    type;
    b_domain;
    t_interval;
    total;

    constructor(model) {
        this.spending = model.spend;
        this.impress = model.impressions;
        this.appName = model.app_name;
        this.sizes = model.size;
        this.type = model.traffic_type;
        this.b_domain = model.bundle_domain;
        this.t_interval = model.time_interval;
        this.total = model.total;
    }
}