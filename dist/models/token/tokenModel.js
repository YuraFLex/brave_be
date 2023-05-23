// const db = require('../../config/db');

// const createToken = async (userId, refreshToken) => {
//   const query = "INSERT INTO dashboard_users_partners (user_id, refresh_token) VALUES (?, ?)";
//   const values = [userId, refreshToken];

//   return new Promise((resolve, reject) => {
//     db.query(query, values, (error, results) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(results.insertId);
//       }
//     });
//   });
// };

// const findTokenByRefreshToken = async (refreshToken) => {
//   const query = "SELECT * FROM dashboard_users_partners WHERE refresh_token = ?";
//   const values = [refreshToken];

//   return new Promise((resolve, reject) => {
//     db.query(query, values, (error, results) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(results[0]);
//       }
//     });
//   });
// };

// module.exports = { createToken, findTokenByRefreshToken };