const express = require('express')
const jwt = require('jsonwebtoken')
const { User } = require('./db/User')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Initialize express server
const app = express()

// This wold normally be in a .env file
const JWT_SECRET = process.env.JWT_SECRET

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
        const foundUser = await User.findOne({where: {email: user.email}})
        // Assign the requested user to equal user
        req.user = foundUser
        console.log(req.user)
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
        email: user.email
    }, JWT_SECRET)

    res.send({
        message: "Success!",
        token
    })
})

// POST /login user to perform neccesary tasks
app.post('/login', async (req, res) => {
    const { email, password } = req.body

    // Find logged in user in db
    const user = await User.findOne({ where: { email } })
    // Compare password with encrypted password
    const validated = await bcrypt.compare(password, user.password)

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

// GET /admin/users login to see more info then a regular user
app.get('/admin/users', setUser, async (req, res) => {
    console.log(req.user)

    if (!req.user) {
        res.sendStatus(401)
    } else {
        // Validate if user is an admin or not
        if (req.user.isAdmin === true) {
            const allusers = await User.findAll()
            console.log(allusers)
            res.send({
                allusers
            })
        } else {
            console.log("ERROR!")
            res.sendStatus(401)
        }
    }
})

// DELETE /user/:id only self can delete self if not an admin
app.delete('/users/:id', setUser, async (req, res) => {
    // If no logged in user send unauthorized
    if (!req.user) {
        res.sendStatus(401)
    } else {
        // Find user by id
        const userId = req.params.id

        const foundUser = await User.findByPk(userId)

        // check if user exists & logged in user is accessing themselves
        if (!foundUser || foundUser.email != req.user.email) {
            res.sendStatus(401)
        } else {
            // Delete user if logged in user is deleting them self
            await foundUser.destroy()
            res.send(`Succesfully deleted!`)
        }
    }
})

// DELETE /admin/user/:id only admins can delete other users and can delete self
app.delete('/admin/users/:id', setUser, async (req, res) => {
    if (!req.user) {
        res.sendStatus(401)
    } else {
        const userId = req.params.id

        const foundUser = await User.findByPk(userId)

        // Check if user has admin rights
        if (req.user.isAdmin === true) {
            await foundUser.destroy()
            res.send(`Succesfully destroyed!`)
        } else {
            res.sendStatus(401)
        }
    }
})


// Error handling middleware
app.use((error, req, res, next) => {
    console.error('SERVER ERROR: ', error);
    if (res.statusCode < 400) res.status(500);
    res.send({ error: error.message, name: error.name, message: error.message });
});

module.exports = app