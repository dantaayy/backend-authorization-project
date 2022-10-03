const { Sequelize, sequelize } = require('./db');

const User = sequelize.define('user', {
  isAdmin: Sequelize.BOOLEAN,
  age: Sequelize.INTEGER,
  name: Sequelize.STRING,
  employee: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  phone: Sequelize.STRING,
  address: Sequelize.STRING,
});

module.exports = { User };
