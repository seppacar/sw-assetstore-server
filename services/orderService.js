const Order = require('../models/order.model')

const { getAssetById, addSoldToInfoToAsset } = require('../services/assetService')
const { addOwnedAssetAsBuyer, getUserById, updateUserBalance } = require('../services/userService')
const { getExchangeRatesFor, convertUSDToCrypto } = require('../utils/exchangeRateUtils')
const logger = require('../utils/logger')

/**
 * Creates a new order.
 * @param {string} userId - The ID of the user placing the order.
 * @param {Array} orderData - The array of order items containing item IDs and tiers.
 * @param {string} paymentMethod - The payment method used for the order.
 * @returns {Promise<Object>} The newly created order object.
 * @throws {Error} If the user is not found, an item already exists in the user's ownedAssets,
 * or if there is an error during order creation.
 */
const createOrder = async (userId, orderData, paymentMethod) => {
  let totalPriceUSD = 0

  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found?')
  }

  // Calculate the total price in USD by summing the pricing.price of each asset
  // items is array of assetId
  await Promise.all(
    orderData.map(async (orderItem) => {
      const existingAsset = user.ownedAssets.find((asset) => asset.assetId.equals(orderItem.itemId))
      if (existingAsset) {
        throw new Error('Asset already exists in user\'s ownedAssets')
      }

      const asset = await getAssetById(orderItem.itemId)
      const tier = asset.pricing.tiers.find((tier) => tier.name === orderItem.tier)

      if (asset && tier.currency === 'USD' && tier.name === orderItem.tier) {
        totalPriceUSD += tier.price
      } else {
        throw new Error(`Something is wrong with the item currency or price. It may not be in USD. Item ID: ${orderItem.itemId}`)
      }
    })
  )

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
  const newOrder = new Order({ user: userId, items: orderData.map((orderItem) => ({ item: orderItem.itemId, tier: orderItem.tier })), amount })
  await newOrder.save()

  return newOrder
}

/**
 * Retrieves all orders from the database.
 * @returns {Promise<Array>} An array of all order objects.
 */
const getAllOrders = async () => {
  return await Order.find({})
}

/**
 * Retrieves an order by its ID.
 * @param {string} id - The ID of the order.
 * @returns {Promise<Object>} The order object.
 * @throws {Error} If the order is not found.
 */
const getOrderById = async (id) => {
  const order = await Order.findById(id)
  if (!order) {
    throw new Error('Order not found')
  }

  return order
}

/**
 * Updates an order by its ID.
 * @param {string} orderId - The ID of the order.
 * @param {Object} orderData - The data to update the order with.
 * @returns {Promise<Object>} The updated order object.
 * @throws {Error} If the order is not found.
 */
const updateOrderById = async (orderId, orderData) => {
  const updatedOrder = await Order.findByIdAndUpdate(orderId, orderData, { new: true })
  if (!updatedOrder) {
    throw new Error('Order not found')
  }
  return updatedOrder
}

/**
 * Deletes an order by its ID.
 * @param {string} id - The ID of the order.
 * @returns {Promise<Object>} The deleted order object.
 * @throws {Error} If the order is not found.
 */
const deleteOrderById = async (id) => {
  const deletedOrder = await Order.findOneAndDelete({ _id: id })
  if (!deletedOrder) {
    const error = new Error('Order not found')
    error.status = 404
    throw error
  }

  return deletedOrder
}

/**
 * Completes an order by updating its status to 'complete' and performing additional actions.
 * @param {string} orderId - The ID of the order to complete.
 * @returns {Promise<Object>} The updated order object.
 * @throws {Error} If the order is not found or if there is an error during completion.
 */
const completeOrder = async (orderId) => {
  // Update order object to complete
  const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'complete' }, { new: true })
  if (!updatedOrder) {
    throw new Error('Order not found')
  }

  // Add items in order to users profile
  const userId = updatedOrder.user
  await Promise.all(updatedOrder.items.map(async (orderItem) => {
    try {
      // Get asset
      const asset = await getAssetById(orderItem.item)
      // Asset creator id
      const assetCreatorId = asset.createdBy.userId
      // Asset price for selected tier
      const assetTierInformation = asset.pricing.tiers.find((tier) => tier.name === orderItem.tier)
      // Update asset creators balance
      await updateUserBalance(assetCreatorId, assetTierInformation.price)
      // Add asset to buyer users profile
      await addOwnedAssetAsBuyer(userId, orderItem)
      // Insert sold to information to the asset
      await addSoldToInfoToAsset(orderItem.item, userId)
    } catch (err) {
      logger.error(`${err.message}, orderId: ${orderId}, itemId: ${orderItem.item}`)
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
