const transactionController = require('../../controllers/transaction.controller')
const { authAdminMiddleware, authStandardUserMiddleware } = require('../../middleware')
const transactionRouter = require('express').Router()

transactionRouter.route('/')
  .get(authAdminMiddleware, transactionController.getAllTransactions)
  .post(authStandardUserMiddleware, transactionController.createTransaction)
transactionRouter.route('/:hash')
  .get(authStandardUserMiddleware, transactionController.getTransactionByHash)
transactionRouter.route('/validateTransaction')
  .post(authStandardUserMiddleware, transactionController.validateTransaction)

module.exports = transactionRouter
