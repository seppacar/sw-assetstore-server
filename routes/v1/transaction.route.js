const transactionController = require('../../controllers/transaction.controller')

const transactionRouter = require('express').Router()
transactionRouter.route('/')
  .get(transactionController.getAllTransaction)

export default transactionRouter
