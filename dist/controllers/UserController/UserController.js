const userService = require("../../services/userService/userService");
class UserController {
  async login(req, res, next) {
    try {
      const {
        email,
        password
      } = req.body;
      const userData = await userService.login(email, password);
      console.log("USER DATA IN USER CONTROLLER:", userData);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async active(req, res, next) {
    try {
      const {
        id
      } = req.params;
      console.log('ID NA GET ZAPROS', id);
      const isActive = await userService.getActiveStatus(id);
      console.log('IS ACTIVE STATUS', isActive);
      return res.json({
        isActive
      });
    } catch (e) {
      next(e);
    }
  }
}
module.exports = new UserController();