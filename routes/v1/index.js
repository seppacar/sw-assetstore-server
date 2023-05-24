const express = require('express') // Import Express framework
const router = express.Router() // Create a new router instance
require('express-async-errors') // For handling async errors easily

// // Import routes
const usersRouter = require('./user.route')
const authRouter = require('./auth.route')
const assetRouter = require('./asset.route')
const ordersRouter = require('./order.route')
const transactionRouter = require('./transaction.route')
// Demo
const demoRouter = require('./demo.route')

// Mount each set of routes on the router
// TODO: Add authentication middlewares to their routes
router.use('/users', usersRouter)
router.use('/auth', authRouter)
router.use('/assets', assetRouter)
router.use('/orders', ordersRouter)
router.use('/transactions', transactionRouter)

// Demo route
router.use('/demo', demoRouter)

module.exports = router // Export the router instance for use in the application
