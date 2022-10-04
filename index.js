const express = require('express')
const jwt = require('jsonwebtoken')
const { User } = require('./db/User')
const bcrypt = require('bcryptjs')

// Initialize express server
const app = express()

// This wold normally be in a .env file
const JWT_SECRET = 'dvbyhs8UpJhzX08fH6yTg2ksnB'

// Make sure express server can talk in json
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Homepage
app.get('/', async (req, res, next) => {
    try {
        res.send(`
            <h1>Welcome to my Backend Authorization Project!</h1>
        `)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// Middleware for authorization
const setUser = async (req, res, next) => {
    // Check request header
    const auth = req.header('Authorization')
    // If no authorizatio move on to next func
    if (!auth) {
        next()
    } else {
        // Split (Bearer 'token') to verify with jwt
        const [, token] = auth.split(' ')
        const user = jwt.verify(token, JWT_SECRET)
        // Assign the requested user to equal user
        req.user = user
        next()
    }
}

// POST /register user to have ability to login with admin defaults to false
app.post('/register', async (req, res) => {
    const { age, name, employee, email, password, phone, address } = req.body
    // Hash the password for security
    const hashedPW = await bcrypt.hash(password, 10)
    // Create user in db
    const user = await User.create({
        isAdmin: false,
        age,
        name,
        employee,
        email,
        password: hashedPW,
        phone,
        address
    })

    // Sign token with jwt
    const token = await jwt.sign({
        id: user.id,
        email
    }, JWT_SECRET)

    res.send({
        message: "Success",
        token
    })
})

// POST /login user to perform neccesary tasks
app.post('/login', async (req, res) => {
    const { email, password } = req.body
    console.log(email)

    // Find logged in user in db
    const user = await User.findOne({ where: { email } })
    // Compare password with encrypted password
    const validated = await bcrypt.compare(password, user.password)
    console.log(validated)

    // Check if user entered correct password
    if (validated) {
        const { id, email } = user

        // Sign token
        const token = jwt.sign({
            id,
            email
        }, JWT_SECRET)

        res.send({
            message: "Success",
            token
        })
    } else {
        // Send 401 Unauthorized status if login fails
        res.sendStatus(401)
    }
})

// GET YOUR User info by id
app.get('/users/:id', setUser, async (req, res) => {
    if (!req.user) {
        // If no user send 401 (Unauthorized) status
        res.sendStatus(401)
    } else {
        const userId = req.params.id

        const foundUser = await User.findByPk(userId)
        // Destructure fields from user
        const { isAdmin, name, employee, email, phone } = foundUser

        // Validate if there is a registered user or if they are
        // trying to access a different user without permission (unless is an admin)
        if (!foundUser || foundUser.id != req.user.id) {
            res.sendStatus(401)
        } else {
            res.send({
                isAdmin,
                name,
                employee,
                email,
                phone
            })
        }
    }
})

// GET /admin login to see more info then a regular user
// // Validate if user is an admin or not
// if (foundUser.isAdmin === true && foundUser.id === req.user.id) {
//     res.send({
//         isAdmin,
//         name,
//         employee,
//         email,
//         phone
//     })
// }

// DELETE /user/:id only self can delete self if not an admin

// DELETE /admin/user/:id only admins can deete other users or self can delete self


// Error handling middleware
app.use((error, req, res, next) => {
    console.error('SERVER ERROR: ', error);
    if (res.statusCode < 400) res.status(500);
    res.send({ error: error.message, name: error.name, message: error.message });
});

module.exports = app