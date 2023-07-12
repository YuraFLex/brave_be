module.exports = class SummaryReportsDto {
    timeouts;
    impressions;
    requests;
    responses;
    spend;
    win_rate;
    gross_point;

    constructor(model) {
        this.timeouts = model.timeouts;
        this.impressions = model.impressions;
        this.requests = model.requests;
        this.responses = model.responses;
        this.spend = model.spend;
        this.win_rate = model.win_rate;
        this.gross_point = model.gross_point;
    }
}