const express = require('express')

// ROUTER TO SEND AND PASS BACK TO SERVER
const router = express.Router()

router.get('/users', (req, res) => {
    res.send(`<h1>User Page</h1>`)
})

module.exports = router