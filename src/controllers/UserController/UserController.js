const userService = require("../../services/userService/userService");

class UserController {

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.login(email, password);

            if (userData.success) {

                return res.status(200).json({ success: true, message: "Login success", user: userData.user });
            } else {

                return res.status(401).json({ success: false, message: "Incorrect email or password" });
            }
        } catch (e) {
            next(e);
        }
    }

}


module.exports = new UserController();
