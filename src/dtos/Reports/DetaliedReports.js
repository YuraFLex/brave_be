module.exports = class DetaliedReportsDto {
    spend;
    impressions;
    app_name;
    size;
    traffic_type;
    bundle_domain;
    site_domain;
    time_interval;
    total;

    constructor(model) {
        this.spend = model.spend;
        this.impressions = model.impressions;
        this.app_name = model.app_name;
        this.size = model.size;
        this.traffic_type = model.traffic_type;
        this.bundle_domain = model.bundle_domain;
        this.site_domain = model.site_domain;
        this.time_interval = model.time_interval;
        this.total = model.total;
    }
}