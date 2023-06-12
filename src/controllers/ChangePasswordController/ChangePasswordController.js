const ChangePasswordService = require('../../services/ChangePasswordService/ChangePasswordService');

class ChangePasswordController {
    async changePassword(req, res, next) {
        const changePwdData = req.body;

        const { oldPassword, newPassword, confirmPassword, userId } = changePwdData;

        // Передача данных в сервис
        const changePasswordService = new ChangePasswordService();
        const result = await changePasswordService.changePassword(
            userId,
            oldPassword,
            newPassword,
            confirmPassword
        );

        // Дополнительная обработка и отправка ответа клиенту
        if (result.success) {
            res.status(200).json({ success: true, message: 'Password successfully changed' });
        } else if (result.error === 'incorrect_password') {
            res.status(400).json({ success: false, message: 'Incorrect old password' });
        } else if (result.error === 'password_mismatch') {
            res.status(400).json({ success: false, message: 'New password and confirm password must match' });
        } else {
            res.status(500).json({ success: false, message: 'An error occurred while changing the password' });
        }
    }
}

module.exports = new ChangePasswordController();
