class dspStatisticsDto {
    constructor(model) {
        this.dsp = model && model.dsp ? model.dsp : null;
        this.bids_dsp_cnt = model && model.bids_dsp_cnt ? model.bids_dsp_cnt : null;
        this.impressions_dsp_sum = model && model.impressions_dsp_sum ? model.impressions_dsp_sum : null;
        this.bids_dsp_sum = model && model.bids_dsp_sum ? model.bids_dsp_sum : null;
    }
}

class sspStatisticsDto {
    constructor(model) {
        this.ssp = model && model.ssp ? model.ssp : null;
        this.bids_ssp_cnt = model && model.bids_ssp_cnt ? model.bids_ssp_cnt : null;
        this.impressions_ssp_sum = model && model.impressions_ssp_sum ? model.impressions_ssp_sum : null;
        this.bids_ssp_sum = model && model.bids_ssp_sum ? model.bids_ssp_sum : null;
    }
}

module.exports = {
    dspStatisticsDto,
    sspStatisticsDto
};
