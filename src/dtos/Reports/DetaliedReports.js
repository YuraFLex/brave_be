module.exports = class DetaliedReportsDto {
    spend;

    constructor(model) {
        this.spend = model.spend;
    }
}