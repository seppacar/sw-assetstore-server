const authController = require('../../controllers/auth.controller')
const authRouter = require('express').Router()

authRouter
  .route('/login')
  .post(authController.login) // User login route

authRouter
  .route('/logout')
  .get(authController.logout) // User logout route

authRouter
  .route('/signup')
  .post(authController.signUp) // User signup route

module.exports = authRouter
