const authController = require('../../controllers/auth.controller')
const authRouter = require('express').Router()

authRouter
  .route('/login')
  .post(authController.login)

authRouter
  .route('/logout')
  .get(authController.logout)

module.exports = authRouter
