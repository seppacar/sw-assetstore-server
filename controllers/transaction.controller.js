const transactionService = require('../services/transactionService')

const createTransaction = async (req, res) => {
  const { orderId, method, data } = req.body
  const transaction = await transactionService.createTransaction(orderId, method, data)
  res.json(transaction)
}
const getAllTransactions = async (req, res) => {
  const transactions = await transactionService.getAllTransactions()
  res.json(transactions)
}

/**
 * Retrieves a transaction by orderId or hash.
 * Either orderId or hash is required as a query parameter, but not both.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getTransaction = async (req, res) => {
  const { orderId, hash } = req.query

  // Check if both orderId and hash are provided
  if (orderId && hash) {
    return res.status(400).json({ error: 'Either orderId or hash should be provided, not both.' })
  }

  // Check if either orderId or hash is provided
  if (!orderId && !hash) {
    return res.status(400).json({ error: 'Either orderId or hash is required.' })
  }

  // Handle the case where orderId is provided
  if (orderId) {
    const transaction = await transactionService.getTransactionByOrderId(orderId)
    return res.json(transaction)
  }

  // Handle the case where hash is provided
  if (hash) {
    const transaction = await transactionService.getTransactionByHash(hash)
    return res.json(transaction)
  }
}

// Get transaction with hash
const getTransactionByHash = async (req, res) => {
  const { hash } = req.params
  const transaction = await transactionService.getTransactionByHash(hash)
  res.json(transaction)
}

// Get transaction with orderId
const getTransactionByOrderId = async (req, res) => {
  const { orderId } = req.params
  const transaction = await transactionService.getTransactionByOrderId(orderId)
  res.json(transaction)
}

const validateTransaction = async (req, res) => {
  const txHash = req.body.txHash
  await transactionService.validateTransaction(txHash)
  res.json('Validation started')
  // const confirmations = await transactionService.validateTransaction(req.body.txHash)
  // res.json(confirmations)
}

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransaction,
  getTransactionByHash,
  getTransactionByOrderId,
  validateTransaction
}
