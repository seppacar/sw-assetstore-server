const orderController = require('../../controllers/order.controller')
const orderRouter = require('express').Router()
const authStandardUserMiddleware = require('../../middleware/authStandardUserMiddleware')
const authAdminMiddleware = require('../../middleware/authAdminMiddleware')

orderRouter
  .route('/')
  .get(authAdminMiddleware, orderController.getAllOrders)
  .post(authStandardUserMiddleware, orderController.createOrder)

orderRouter
  .route('/:id')
  .get(authStandardUserMiddleware, orderController.getOrderById)
  .delete(authAdminMiddleware, orderController.deleteOrderById)

module.exports = orderRouter
