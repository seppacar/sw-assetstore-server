const orderController = require('../../controllers/order.controller')
const orderRouter = require('express').Router()

orderRouter
  .route('/')
  .get(orderController.getAllOrders)
  .post(orderController.createOrder)

module.exports = orderRouter
