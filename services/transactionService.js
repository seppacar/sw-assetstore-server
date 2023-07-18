const logger = require('../utils/logger')
const { delay } = require('../utils/common')

const { getEthereumTransactionDetails, getAvalancheTransactionDetails, getPolygonTransactionDetails, getSepoliaTransactionDetails, getGoerliTransactionDetails } = require('../utils/blockchainUtils')

const { completeOrder, getOrderById } = require('../services/orderService')

const Transaction = require('../models/transaction.model')

/**
 * Creates a new transaction.
 * @param {string} orderId - The ID of the associated order.
 * @param {string} method - The method used for the transaction.
 * @param {Object} data - The data related to the transaction.
 * @returns {Promise<Object>} The newly created transaction object.
 */
const createTransaction = async (orderId, method, data) => {
  const newTransaction = new Transaction({ orderId, method, data })
  await newTransaction.save()
  return newTransaction
}

/**
 * Retrieves all transactions from the database.
 * @returns {Promise<Array>} An array of all transaction objects.
 */
const getAllTransactions = async () => {
  const transactions = await Transaction.find({})
  return transactions
}

/**
 * Retrieves a transaction by its transaction hash.
 * @param {string} txHash - The transaction hash.
 * @returns {Promise<Object>} The transaction object.
 */
const getTransactionByHash = async (txHash) => {
  return await Transaction.findOne({ 'data.transactionHash': txHash })
}

/**
 * Retrieves a transaction by its associated order ID.
 * @param {string} orderId - The ID of the associated order.
 * @returns {Promise<Object>} The transaction object.
 */
const getTransactionByOrderId = async (orderId) => {
  return await Transaction.findOne({ orderId })
}

/**
 * Validates a transaction by its transaction hash.
 * @param {string} txHash - The transaction hash.
 * @returns {Promise<void>}
 * @throws {Error} If the transaction is not found or if there is an error during validation.
 */
const validateTransaction = async (txHash) => {
  const txObject = await Transaction.findOne({ 'data.transactionHash': txHash })
  if (!txObject) {
    throw new Error('Transaction not found')
  }
  if (txObject.method === 'blockchain') {
    await triggerValidateBlockchainTransaction(txHash)
  } else if (txObject.method === 'creditCard') {
    return null
  }
}

/**
 * Validates a blockchain transaction by its transaction hash.
 * @param {string} txHash - The transaction hash.
 * @returns {Promise<Object>} The validation result.
 * @throws {Error} If the transaction is not found or if there is an error during validation.
 */
const validateBlockchainTransaction = async (txHash) => {
  const txObject = await Transaction.findOne({ 'data.transactionHash': txHash })
  const chainId = txObject.data.chainId

  let txDetails, orderId // Order id is inputdata of the transaction so txDetails.inputData, normally its a hex but converted to string in util

  switch (chainId) {
    case '1': // Ethereum
      try {
        txDetails = await getEthereumTransactionDetails(txHash)
        orderId = txDetails.inputData
      } catch (error) {
        console.error('Error retrieving Ethereum transaction details:', error)
        throw error
      }
      break
    case '43114': // Avalanche
      try {
        txDetails = await getAvalancheTransactionDetails(txHash)
        orderId = txDetails.inputData
      } catch (error) {
        console.error('Error retrieving Avalanche transaction details:', error)
        throw error
      }
      break
    case '137': // Polygon
      try {
        txDetails = await getPolygonTransactionDetails(txHash)
        orderId = txDetails.inputData
      } catch (error) {
        console.error('Error retrieving Polygon transaction details:', error)
        throw error
      }
      break
    case '11155111': // Sepolia Testnet
      try {
        txDetails = await getSepoliaTransactionDetails(txHash)
        orderId = txDetails.inputData
      } catch (error) {
        console.error('Error retrieving Sepolia transaction details:', error)
        throw error
      }
      break
    case '5': // Goerli Testnet
      try {
        txDetails = await getGoerliTransactionDetails(txHash)
        orderId = txDetails.inputData
      } catch (error) {
        console.error()
        throw error
      }
      break
    default:
      throw new Error('Invalid chainId')
  }
  // Find and validate order bond to the transaction
  const order = await getOrderById(orderId)
  // If tx already confirmed and order status is complete
  // if (txObject.status === 'confirmed' && order.status === 'complete') {
  //   return { message: `Transaction complete and confirmed successfully  for txHash: ${txHash}.`, isSuccess: true }
  // }
  // If there is more than 6 confirmations consider transaction as done and do rest
  if (txDetails.confirmations > 6) {
    // Compare order objects amountToPay value and txDetails paid amount(this might fail due to long numbers of the EVM tokens)
    const amountNeedToPay = Number(order.amount[txDetails.symbol])
    const amountPaid = Number(txDetails.amount)
    if (amountPaid >= amountNeedToPay) {
      // Set transaction as complete
      txObject.status = 'confirmed'
      await txObject.save()
      // Set order as complete
      completeOrder(orderId)
      // Add items to users profile
      return { message: `Transaction complete and confirmed successfully for txHash: ${txHash}.`, isSuccess: true }
    } else {
      return ({ message: `Amount not equal? receiverd amount: ${amountPaid}, expected amount: ${amountNeedToPay}`, result: false })
    }
  } else {
    return { message: `Transaction not confirmed yet for txHash: ${txHash}, ${txDetails.confirmations} confirmations`, isSuccess: false }
  }
}

/**
 * Triggers the validation mechanism for a blockchain transaction.
 * @param {string} txHash - The transaction hash.
 * @returns {Promise<void>}
 */
const triggerValidateBlockchainTransaction = async (txHash) => {
  let counter = 0
  let isSuccess = false
  while (counter < 50) {
    const response = await validateBlockchainTransaction(txHash)
    if (response.isSuccess) {
      isSuccess = true
      break
    }
    logger.info(response.message)
    counter++
    await delay(1000 * 5 * 1)
  }
  if (isSuccess) {
    logger.info('Blockchain transaction validation successfully complete for txHash: ' + txHash)
  } else {
    logger.error('Blockchain transaction failed for txHash: ' + txHash)
  }
}

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionByHash,
  getTransactionByOrderId,
  validateTransaction
}
