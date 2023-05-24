const orderService = require('../services/orderService')

const createOrder = async (req, res) => {
  const userId = req.user.id
  const { items, paymentMethod } = req.body
  const newOrder = await orderService.createOrder(userId, items, paymentMethod)

  res.json(newOrder)
}
// Admin
const getAllOrders = async (req, res) => {
  const orders = await orderService.getAllOrders()

  res.json(orders)
}

const getOrderById = async (req, res) => {
  const orderId = req.params.id
  const order = await orderService.getOrderById(orderId)

  res.json(order)
}

// Admin
// Better not expose to endpoints?
const updateOrder = async (req, res) => {
  res.json('')
}

// Admin
const deleteOrderById = async (req, res) => {
  const orderId = req.params.id
  const deletedOrder = await orderService.deleteOrderById(orderId)
  res.json(deletedOrder)
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrderById

}
