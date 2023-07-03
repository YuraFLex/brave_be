class dspStatisticsDto {
    constructor(model) {
        this.bids_cnt = model && model.bids_dsp_cnt ? model.bids_dsp_cnt : null;
        this.impressions_sum = model && model.impressions_dsp_sum ? model.impressions_dsp_sum : null;
        this.bids_sum = model && model.bids_dsp_sum ? model.bids_dsp_sum : null;
        this.impressions_cnt = model && model.impressions_cnt ? model.impressions_cnt : null;
    }
}

class sspStatisticsDto {
    constructor(model) {
        this.bids_cnt = model && model.bids_ssp_cnt ? model.bids_ssp_cnt : null;
        this.impressions_sum = model && model.impressions_ssp_sum ? model.impressions_ssp_sum : null;
        this.bids_sum = model && model.bids_ssp_sum ? model.bids_ssp_sum : null;
        this.impressions_cnt = model && model.impressions_cnt ? model.impressions_cnt : null;
    }
}

module.exports = {
    dspStatisticsDto,
    sspStatisticsDto
};