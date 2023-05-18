const userController = require('../../controllers/user.controller')
const { authUserMiddleware } = require('../../middleware')
const { authAdminMiddleware } = require('../../middleware')

const usersRouter = require('express').Router()

usersRouter
  .route('/')
  .get(authAdminMiddleware, userController.getAllUsers)
  .post(userController.createUser)

usersRouter.route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById)

module.exports = usersRouter
