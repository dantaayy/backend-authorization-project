const express = require("express")
const colors = require("colors")
const path = require("path")
const morgan = require("morgan")

// GRAB PATHS FROM FILE
const routes = require('./src/routes/index')

// INITIALIZE EXPRESS
const app = express()

const PORT = process.env.PORT

// MIDDLEWARE
app.use(morgan('dev'))

// SET UP PUBLIC WEBPAGE ACCESS
app.use(express.static(path.join(__dirname, 'src', 'public')))

// DESTINATION TO SEND THIS REQUEST
app.get('/', (req, res) => {
    res.send('./index.html')
})

// ROUTES WITH / IN URL
app.use('/', routes)

app.listen(PORT || 8000, () => {
    console.log(colors.rainbow(`
    🚀  Server is running!
    🔉  Listening on port ${PORT}
    📭  Webpage at http://localhost:8000`
    ))
})