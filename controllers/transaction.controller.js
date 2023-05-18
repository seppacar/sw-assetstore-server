const Order = require('../models/order.model')

const createTransaction = (req, res) => {
  res.json('created?')
}

const getAllTransactions = (req, res) => {
  res.json('yes')
}

// TODO: Will validate payment here
// Passing orderid as param
// If payment already done return success
// If payment method cryptocurrency check hash and orderıd if required confirmations done
// add assets to buyer document
// If payment method credit card redirect payment provider here after success or fail so we can check status here
// validate orderid and do stuff
// if payment failed do nothing return response
const validateTransaction = (req, res) => {
  res.json('Payment success, assets added to owner')
}

module.exports = {
  getAllTransactions,
  createTransaction,
  validateTransaction
}
