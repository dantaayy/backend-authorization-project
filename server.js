const app = require('./index')
const { sequelize } = require('./db')
const colors = require('colors')

const { PORT = 4000 } = process.env

app.listen(PORT, () => {
    sequelize.sync({ force: false });
    console.log(colors.inverse.blue(`
    🚀  Server is running!
    🔉  Listening on port ${PORT}
    📭  Webpage at http://localhost:4000`
    ))
})