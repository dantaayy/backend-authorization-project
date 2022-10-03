const path = require('path');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('backend-api', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

module.exports = {
    sequelize,
    Sequelize
};