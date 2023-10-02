const ChangePasswordService = require('../../services/ChangePasswordService/ChangePasswordService');

class ChangePasswordController {
    async changePassword(req, res, next) {
        const changePwdData = req.body;

        const { oldPassword, newPassword, confirmPassword, user_id } = changePwdData;

        const changePasswordService = new ChangePasswordService();
        const result = await changePasswordService.changePassword(
            user_id,
            oldPassword,
            newPassword,
            confirmPassword
        );
        console.log('result:', result);
        if (result.success) {
            res.status(200).json({ success: true, message: 'Password successfully changed' });
        } else {
            res.status(400).json({ success: false, message: 'Incorrect Password' });
        }
    }
}

module.exports = new ChangePasswordController();
