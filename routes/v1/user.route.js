const userController = require('../../controllers/user.controller')
const { authAdminMiddleware, authStandardUserMiddleware } = require('../../middleware')

const usersRouter = require('express').Router()

usersRouter
  .route('/')
  .get(authAdminMiddleware, userController.getAllUsers) // Get all users (admin access required)
  .post(userController.createUser) // Create a new user (admin access required)

usersRouter.route('/:id')
  .get(authAdminMiddleware, userController.getUserById) // Get user by ID (admin access required)
  .patch(authAdminMiddleware, userController.updateUserById) // Update user by ID (admin access required)
  .delete(authAdminMiddleware, userController.deleteUserById) // Delete user by ID (admin access required)

usersRouter.route('/:id/getOwned')
  .get(authStandardUserMiddleware, userController.getOwnedAssets) // Get owned assets of a user (standard user access required)

module.exports = usersRouter
