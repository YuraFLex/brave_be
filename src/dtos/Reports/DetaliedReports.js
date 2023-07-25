module.exports = class DetaliedReportsDto {
    spend;
    impressions;
    app_name;
    app_bundle;
    pub_id;
    dspSource_id;
    source_id;
    region;
    size;
    traffic_type;
    time_interval;

    constructor(model) {
        this.spend = model.spend;
        this.impressions = model.impressions;
        this.app_name = model.app_name;
        this.app_bundle = model.app_bundle;
        this.pub_id = model.pub_id;
        this.dspSource_id = model.dspSource_id;
        this.source_id = model.source_id;
        this.region = model.region;
        this.size = model.size;
        this.traffic_type = model.traffic_type;
        this.time_interval = model.time_interval;
    }
}