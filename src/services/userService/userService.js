const UserModel = require("../../models/userModel/userModel");
const UserDto = require("../../dtos/userDto/userDto");

class UserService {
  async login(email, password) {
    const user = await UserModel.findOne(email, password);

    if (!user) {
      return {
        success: false,
        message: "Email or password is incorrect",
      };
    }

    const passwordResult = password === user.password;
    if (passwordResult) {
      const { id, type, partner, partner_id, isActive } = user;

      const userDto = new UserDto(user);
      userDto.id = id;
      userDto.type = type;
      userDto.partner = partner;
      userDto.partner_id = partner_id;
      userDto.isActive = isActive;

      return {
        success: true,
        message: "Login successful",
        user: userDto,
      };
    } else {
      return {
        success: false,
        message: "Email or password is incorrect",
      };
    }
  }
}

module.exports = new UserService();
