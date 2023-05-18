const Order = require('../models/order.model')

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
  res.json(orders)
}
const createOrder = async (req, res) => {
  const userId = req.user.id
  const { items, paymentMethod } = req.body
  // Calculate total price here
  const totalPrice = 0

  const newOrder = new Order({ userId, items, paymentMethod, totalPrice })
  await newOrder.save()
  return res.json(newOrder)
}

const deleteOrder = async (req, res) => {
  res.json('')
}

const updateOrder = async (req, res) => {
  res.json('')
}

module.exports = {
  getAllOrders,
  createOrder,
  deleteOrder,
  updateOrder
}
