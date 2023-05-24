const demoRouter = require('express').Router()
const Web3 = require('web3')
const { getExchangeRatesFor } = require('../../utils/exchangeRateUtils')
const { getGoerliTransactionDetails } = require('../../utils/blockchainUtils')
demoRouter.get('/', async (req, res) => {
  const rate = await getExchangeRatesFor('USD')
  //   const r = await getGoerliTransactionDetails('b3d8ea16648002fa612e6488d1328f47dbe921b52e3658dfb7d2')
  res.json(rate)
})

module.exports = demoRouter
