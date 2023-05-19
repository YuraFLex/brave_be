const userService = require("../../services/userService/userService");

class UserController {

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            console.log('EMAIL IN USER CONTROLLER:', email);
            const userData = await userService.login(email, password);


            console.log("USER DATA IN USER CONTROLLER:", userData);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();

