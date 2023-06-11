require('dotenv').config();
const mysql = require('mysql2');

function createConnection() {
    const connection = mysql.createConnection({
        user: process.env.DB_USER_MAIN || 'goodguys',
        password: process.env.DB_PASSWORD_MAIN || 'g29Zl5VxT7QcHKsR01G',
        database: process.env.DB_NAME_MAIN || 'brave_new',
        host: process.env.DB_HOST_MAIN || '88.214.194.188',
        port: process.env.DB_PORT_MAIN || '3306',
        dialect: 'mysql',
    });

    return connection;
}

module.exports = {
    createConnection: createConnection,
};
