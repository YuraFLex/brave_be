const UserModel = require("../../models/userModel/userModel");
const UserDto = require("../../dtos/userDto");

class UserService {

  async login(email) {
    const user = await UserModel.findOne(email);

    const { type, partner, isActive } = user;

    const userDto = new UserDto(user);
    userDto.type = type;
    userDto.partner = partner;
    userDto.isActive = isActive;

    console.log('USER IN USER SERVICE:', user);

    return {
      user: userDto,
    };
  }


} 
  
  module.exports = new UserService();
