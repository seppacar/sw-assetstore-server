const userController = require('../../controllers/user.controller')
const { authAdminMiddleware, authUserMiddleware } = require('../../middleware')

const usersRouter = require('express').Router()

usersRouter
  .route('/')
  .get(authAdminMiddleware, userController.getAllUsers)
  .post(authAdminMiddleware, userController.createUser)

usersRouter.route('/:id')
  .get(authAdminMiddleware, userController.getUserById)
  .patch(authAdminMiddleware, userController.updateUserById)
  .delete(authAdminMiddleware, userController.deleteUserById)
usersRouter.route('/:id/getOwned')
  .get(authUserMiddleware, userController.getOwnedAssets)

module.exports = usersRouter
