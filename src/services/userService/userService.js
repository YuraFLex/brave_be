const UserModel = require("../../models/userModel/userModel");
const UserDto = require("../../dtos/userDto");
const db = require('../../config/db')

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


    const { id, type, partner, isActive } = user;

    const userDto = new UserDto(user);
    userDto.id = id;
    userDto.type = type;
    userDto.partner = partner;
    userDto.isActive = isActive;

    return {
      user: userDto,
    };
  }


  async getActiveStatus(id) {
    console.log('EMAIL:', id);
    return new Promise((resolve, reject) => {
      const query = `SELECT isActive FROM dashboard_users_partners WHERE id = '${id}'`;
      const values = [id];
      console.log('VALUES', values);

      db.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          const isActive = results.length > 0 ? Boolean(results[0].isActive) : false;
          resolve(isActive);
        }
      });
    });
  }


}

module.exports = new UserService();
