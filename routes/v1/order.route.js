const orderController = require('../../controllers/order.controller')
const orderRouter = require('express').Router()
const authUserMiddleware = require('../../middleware/authUserMiddleware')
const authAdminMiddleware = require('../../middleware/authAdminMiddleware')

orderRouter
  .route('/')
  .get(authAdminMiddleware, orderController.getAllOrders)
  .post(authUserMiddleware, orderController.createOrder)

orderRouter
  .route('/:id')
  .get(authAdminMiddleware, orderController.getOrderById)
  .delete(authAdminMiddleware, orderController.deleteOrderById)

module.exports = orderRouter
