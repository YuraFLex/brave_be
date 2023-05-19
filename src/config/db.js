// const Sequilize = require('sequelize')

// module.exports = new Sequilize('brave_new', 'makesivan', 'r833ydjx', {
//     host: '88.214.194.188',
//     dialect: 'mysql',
//     operatorsAliases: 0,
//     pool: {
//         max: 15,
//         min: 0,
//         acquire: 3000,
//         idle: 10000
//     }
// })





require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    user: process.env.DB_USER_MAIN || 'goodguys',
    password: process.env.DB_PASSWORD_MAIN || 'g29Zl5VxT7QcHKsR01G',
    database: process.env.DB_NAME_MAIN || 'brave_new',
    host: process.env.DB_HOST_MAIN || '88.214.194.188',
    port: process.env.DB_PORT_MAIN || '3020',
    dialect: 'mysql',
})

connection.connect(function (error) {
    const port = process.env.DB_PORT_MAIN
    if (error) {
        throw error
    } else {
        console.log(`Conected to database on Port ${port}`);
    }
})

module.exports = connection;


