module.exports = class StatisticsDto {
    bids_cnt;
    spend;
    bids_sum;
    impressions_cnt;

    constructor(model) {
        this.bids_cnt = model && model.bids_cnt ? model.bids_cnt : null;
        this.spend = model && model.spend ? model.spend : null;
        this.bids_sum = model && model.bids_sum ? model.bids_sum : null;
        this.impressions_cnt = model && model.impressions_cnt ? model.impressions_cnt : null;
    }
}

