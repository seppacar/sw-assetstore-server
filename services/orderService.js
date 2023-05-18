const Order = require('../models/order.model')
const Asset = require('../models/asset.model')

const createOrder = async (userId, items, paymentMethod) => {
  let totalPrice = 0
  for (const item of items) {
    const asset = await Asset.findById(item)
    totalPrice += asset.pricing.price
  }

  const payment = {
    method: paymentMethod,
    currency: 'USD',
    amount: totalPrice
  }

  const newOrder = new Order({ user: userId, items, payment })
  await newOrder.save()

  return newOrder
}
const getAllOrders = async () => {
  return await Order.find({})
}

const getOrderById = async (id) => {
  const order = await Order.findById(id)
  if (!order) {
    throw new Error('Order not found')
  }

  return order
}

const updateOrderById = async (id) => {
  return ('todo')
}

const deleteOrderById = async (id) => {
  const deletedOrder = await Order.findOneAndDelete({ _id: id })
  if (!deletedOrder) {
    const error = new Error('Order not found')
    error.status = 404
    throw error
  }

  return deletedOrder
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById
}
