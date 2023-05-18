const express = require('express') // Import Express framework
const router = express.Router() // Create a new router instance
require('express-async-errors') // For handling asynchronos errors easily

// // Import routes for users, posts, and comments
const usersRouter = require('./user.route')
const authRouter = require('./auth.route')
const assetRouter = require('./asset.route')
const ordersRouter = require('./order.route')

// const postRoutes = require('./post');
// const commentRoutes = require('./comment');

// Mount each set of routes on the router
// TODO: Add authentication middlewares to their routes
router.use('/users', usersRouter)
router.use('/auth', authRouter)
router.use('/assets', assetRouter)
router.use('/orders', ordersRouter)

module.exports = router // Export the router instance for use in the application
