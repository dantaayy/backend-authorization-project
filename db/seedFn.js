const {sequelize} = require('./db');
const {User} = require('./');
const users = require('./seedData');
const bcrypt = require('bcryptjs')

// HASH PASSWORD
users.forEach(async (user) => {
  const hashPW = await bcrypt.hash(user.password, 10)
  user.password = hashPW
})

const seed = async () => {
  await sequelize.sync({ force: true }); // recreate db
  await User.bulkCreate(users);
};

module.exports = seed;
