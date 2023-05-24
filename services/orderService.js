const Order = require('../models/order.model')

const { getAssetById, addSoldToInfoToAsset } = require('../services/assetService')
const { addOwnedAssetAsBuyer, getUserById } = require('../services/userService')
const { getExchangeRatesFor, convertUSDToCrypto } = require('../utils/exchangeRateUtils')
const logger = require('../utils/logger')

const createOrder = async (userId, items, paymentMethod) => {
  let totalPriceUSD = 0

  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found?')
  }

  // Calculate the total price in USD by summing the pricing.price of each asset
  // items is array of assetId
  for (const item of items) {
    // Check if the asset already exists in ownedAssets
    const existingAsset = user.ownedAssets.find(asset => asset.assetId.equals(item))
    if (existingAsset) {
      throw new Error('Asset already exists in user\'s ownedAssets')
    }
    //
    const asset = await getAssetById(item)
    if (asset && asset.pricing.currency === 'USD') {
      totalPriceUSD += asset.pricing.price
    } else {
      throw new Error('Something is wrong with the item currency or price. It may not be in USD. Item ID: ' + item)
    }
  }

  // Retrieve exchange rates for USD against other currencies considering we are using USD by default in our app
  const USDExchangeRates = await getExchangeRatesFor('USD')

  // Convert Exchange rates from ETH to WEI

  // Calculate the amount in different currencies based on the total price in USD and exchange rates
  const amount = {
    USD: totalPriceUSD, // US Dollars
    TRY: (totalPriceUSD * (USDExchangeRates.TRY)).toFixed(2), // Turkish Lira fixed by 2 decimals
    ETH: convertUSDToCrypto(totalPriceUSD, USDExchangeRates.ETH), // Ethereum ETH
    MATIC: convertUSDToCrypto(totalPriceUSD, USDExchangeRates.MATIC), // Polygon MATIC
    AVAX: convertUSDToCrypto(totalPriceUSD, USDExchangeRates.AVAX) // Avalanche AVAX
  }

  // Create a new order with the provided details
  const newOrder = new Order({ user: userId, items, amount })
  await newOrder.save()

  return newOrder
}

// Retrieve all orders from the database
const getAllOrders = async () => {
  return await Order.find({})
}

// Retrieve an order by its ID
const getOrderById = async (id) => {
  const order = await Order.findById(id)
  if (!order) {
    throw new Error('Order not found')
  }

  return order
}

const updateOrderById = async (orderId, orderData) => {
  const updatedOrder = await Order.findByIdAndUpdate(orderId, orderData, { new: true })
  if (!updatedOrder) {
    throw new Error('Order not found')
  }
  return updatedOrder
}

// Delete an order by its ID
const deleteOrderById = async (id) => {
  const deletedOrder = await Order.findOneAndDelete({ _id: id })
  if (!deletedOrder) {
    const error = new Error('Order not found')
    error.status = 404
    throw error
  }

  return deletedOrder
}

const completeOrder = async (orderId) => {
  // Update order object to complete
  const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'complete' }, { new: true })
  if (!updatedOrder) {
    throw new Error('Order not found')
  }
  // Add items in order to users profile
  const userId = updatedOrder.user
  await Promise.all(updatedOrder.items.map(async (itemId) => {
    try {
      await addOwnedAssetAsBuyer(userId, itemId)

      // Insert sold to information to the asset
      await addSoldToInfoToAsset(itemId, userId)
    } catch (err) {
      logger.error(`${err.message}, orderId: ${orderId}, itemId: ${itemId}`)
    }
  }))
  return updatedOrder
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  completeOrder
}
