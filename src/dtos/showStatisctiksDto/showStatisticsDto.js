module.exports = class StatisticsDto {
    bids_cnt;
    impressions_sum;
    bids_sum;
    impressions_cnt;

    constructor(model) {
        this.bids_cnt = model && model.bids_cnt ? model.bids_cnt : null;
        this.impressions_sum = model && model.impressions_sum ? model.impressions_sum : null;
        this.bids_sum = model && model.bids_sum ? model.bids_sum : null;
        this.impressions_cnt = model && model.impressions_cnt ? model.impressions_cnt : null;
    }
}

