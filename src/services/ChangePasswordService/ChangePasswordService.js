const ChangePassword = require('../../models/ChangePassword/ChangePassword');

class ChangePasswordService {
    async changePassword(userId, oldPassword, newPassword) {

        try {
            const changePasswordModel = new ChangePassword();
            const userData = await changePasswordModel.getUserByIdAndPassword(userId, oldPassword);

            if (userData) {
                await changePasswordModel.updatePassword(userId, newPassword);

                return { success: true, message: 'Password successfully changed' };
            } else {
                return { success: false, error: 'Incorrect Password' };
            }
        } catch (error) {
            return { success: false, message: 'An error occurred while changing the password' };
        }
    }
}

module.exports = ChangePasswordService;
