const { User } = require('./User');
const { sequelize, Sequelize } = require('./db');

module.exports = {
    User,
    sequelize,
    Sequelize
};
