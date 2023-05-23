// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = new Sequelize('sqlite::memory:')

// const UserModel = sequelize.define(
//   'dashboard_users_partners',
//   {
//     email: {
//       type: DataTypes.STRING(50),
//       notEmpty: true,
//       allowNull: false,
//       unique: true,
//     },
//     password: {
//       type: DataTypes.STRING(100),
//       notEmpty: true,
//       allowNull: false,
//     },
//     type: {
//       type: DataTypes.STRING(50),
//       notEmpty: true,
//       allowNull: false,
//     },
//     partner: {
//       type: DataTypes.STRING(50),
//       notEmpty: true,
//       allowNull: false,
//     },
//     isActive: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: true,
//     },
//   },
//   {
//     freezeTableName: true,
//     timestamps: false,
//   }
// );

// module.exports = UserModel;

// const db = require("../../config/db");

// const UserModel = {

//   findOne: function (email,) {
//     return new Promise((resolve, reject) => {
//       const query = `SELECT * FROM dashboard_users_partners WHERE email = '${email}'`;
//       const values = [email];

//       db.query(query, values, (error, results) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(results[0]);
//         }
//       });
//     });
//   },

// };

// module.exports = UserModel;

const db = require("../../config/db");
const UserModel = {
  findOne: function (email, password) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM dashboard_users_partners WHERE email = ? AND password = ?`;
      const values = [email, password];
      db.query(query, values, (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length === 0) {
            resolve(null);
          } else {
            const user = results[0];
            resolve(user);
          }
        }
      });
    });
  }
};
module.exports = UserModel;