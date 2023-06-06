const UserModel = require("../../models/userModel/userModel");
const UserDto = require("../../dtos/userDto/userDto");

class UserService {

  async login(email, password) {
    const user = await UserModel.findOne(email, password);

    if (!user) {
      const passwordResult = (req.body.password === user.password)
      if (passwordResult) {
        res.status(200).json({
          message: "Login success"
        })
      } else {
        res.status(401).json({
          message: "Login failed"
        })
      }
    }


    const { id, type, partner, partner_id, isActive } = user;

    const userDto = new UserDto(user);
    userDto.id = id;
    userDto.type = type;
    userDto.partner = partner;
    userDto.partner_id = partner_id;
    userDto.isActive = isActive;

    return {
      user: userDto,
    };
  }
}

module.exports = new UserService();
