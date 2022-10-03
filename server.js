const app = require('./index')
const {sequelize} = require('./db')

const { PORT = 4000 } = process.env

app.listen(PORT || 8000, () => {
    console.log(colors.inverse.blue(`
    🚀  Server is running!
    🔉  Listening on port ${PORT}
    📭  Webpage at http://localhost:8000`
    ))
})