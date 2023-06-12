module.exports = class ChangePasswordDto {
    userId;
    oldPassword;
    newPassword;

    constructor(model) {
        this.userId = model.userId;
        this.oldPassword = model.oldPassword;
        this.newPassword = model.newPassword;
    }

}