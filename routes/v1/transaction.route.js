const transactionController = require('../../controllers/transaction.controller')
const transactionRouter = require('express').Router()

transactionRouter.route('/')
  .get(transactionController.getAllTransactions)
  .post(transactionController.createTransaction)
transactionRouter.route('/:hash')
  .get(transactionController.getTransactionByHash)
transactionRouter.route('/validateTransaction')
  .post(transactionController.validateTransaction)

module.exports = transactionRouter
