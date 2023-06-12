const db = require('../../config/db');

class ChangePassword {
    async getUserByIdAndPassword(userId, oldPassword) {
        try {
            const connection = db.createConnection();

            return new Promise((resolve, reject) => {
                connection.connect(function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        const query = 'SELECT id, password FROM dashboard_users_partners WHERE id = ? AND password = ?';
                        const values = [userId, oldPassword];

                        connection.query(query, values, (error, results) => {
                            connection.end();

                            if (error) {
                                reject(error);
                            } else {
                                if (results.length > 0) {
                                    const userData = results[0];
                                    resolve(userData);
                                } else {
                                    reject(new Error('incorrect_password'));
                                }
                            }
                        });
                    }
                });
            });
        } catch (error) {
            throw error;
        }
    }

    async updatePassword(userId, newPassword) {
        try {
            const connection = db.createConnection();

            return new Promise((resolve, reject) => {
                connection.connect(function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        const query = 'UPDATE dashboard_users_partners SET password = ? WHERE id = ?';
                        const values = [newPassword, userId];

                        connection.query(query, values, (error) => {
                            connection.end();

                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ChangePassword;
