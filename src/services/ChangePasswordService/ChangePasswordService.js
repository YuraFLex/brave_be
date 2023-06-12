const ChangePassword = require('../../models/ChangePassword/ChangePassword');

class ChangePasswordService {
    async changePassword(userId, oldPassword, newPassword, confirmPassword) {

        if (newPassword === confirmPassword) {
            try {
                const changePasswordModel = new ChangePassword();
                const userData = await changePasswordModel.getUserByIdAndPassword(userId, oldPassword);

                if (userData) {
                    // Если найдено совпадение по userId и oldPassword, обновляем пароль в базе данных
                    await changePasswordModel.updatePassword(userId, newPassword);

                    // Возвращаем успешный результат
                    return { success: true, message: 'Password successfully changed' };
                } else {
                    // Обработка ошибки, если не найдено совпадение по userId и oldPassword
                    return { success: false, error: 'incorrect_password' };
                }
            } catch (error) {
                // Обработка ошибки базы данных или других ошибок
                return { success: false, message: 'An error occurred while changing the password' };
            }
        } else {
            // Возвращаем ошибку, если newPassword и confirmPassword не совпадают
            return { success: false, error: 'password_mismatch' };
        }
    }
}

module.exports = ChangePasswordService;
