module.exports = class DetaliedReportsDto {
    spend;
    impressions;
    app_name;
    app_bundle;
    pub_id;
    region;
    size;
    traffic_type;
    platform;
    bundle_domain;
    site_domain;
    time_interval;

    constructor(model) {
        this.spend = model.spend;
        this.impressions = model.impressions;
        this.app_name = model.app_name;
        this.app_bundle = model.app_bundle;
        this.pub_id = model.pub_id;
        this.region = model.region;
        this.size = model.size;
        this.traffic_type = model.traffic_type;
        this.platform = model.platform;
        this.bundle_domain = model.bundle_domain;
        this.site_domain = model.site_domain;
        this.time_interval = model.time_interval;
    }
}