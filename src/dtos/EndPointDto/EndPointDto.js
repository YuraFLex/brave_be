class EndPointDto {
    id;
    point;
    pass;
    constructor(model) {
        this.id = model.id;
        this.point = model.point;
        this.pass = model.pass;
    }
}

module.exports = EndPointDto;
