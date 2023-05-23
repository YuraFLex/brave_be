const {
  Sequelize
} = require('sequelize');
const sequelize = new Sequelize('brave_new', 'makesivan', 'r833ydjx', {
  host: '88.214.194.188',
  dialect: 'mysql'
});
module.exports = sequelize;