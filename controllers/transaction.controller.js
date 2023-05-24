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

// Get transaction with hash
const getTransactionByHash = async (req, res) => {
  const { hash } = req.params
  const transaction = await transactionService.getTransactionByHash(hash)
  res.json(transaction)
}

const validateTransaction = async (req, res) => {
  const txHash = req.body.txHash
  transactionService.validateTransaction(txHash)
  res.json('Validation started')
  // const confirmations = await transactionService.validateTransaction(req.body.txHash)
  // res.json(confirmations)
}

module.exports = {
  getAllTransactions,
  createTransaction,
  getTransactionByHash,
  validateTransaction
}
