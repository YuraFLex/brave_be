const db = require("../../config/db");

const UserModel = {
  findOne: function (email, password) {
    return new Promise((resolve, reject) => {
      const connection = db.createConnection();

      connection.connect(function (error) {
        if (error) {
          reject(error);
        } else {
          const query = `SELECT * FROM dashboard_users_partners WHERE email = ? AND password = ?`;
          const values = [email, password];

          connection.query(query, values, (error, results) => {
            connection.end();

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
        }
      });
    });
  },
};

module.exports = UserModel;
