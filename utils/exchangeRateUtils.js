const Web3 = require('web3')

const axios = require('axios')

const BASE_URL = 'https://api.coinbase.com/v2/exchange-rates?currency='

/**
 * Get the current exchange rate between two symbols.
 * Returned rate defines the exchange rate for one unit of symbol1 in terms of symbol2.
 * @param {string} symbol1 - Symbol of the first currency/token
 * @param {string} symbol2 - Symbol of the second currency/token
 * @returns {Promise<number>} - Promise that resolves with the exchange rate
 */
const getExchangeRateBetween = async (symbol1, symbol2) => {
  const requestUrl = `${BASE_URL}${symbol1}`
  try {
    const response = await axios.get(requestUrl)
    return response.data.data.rates[symbol2]
  } catch (error) {
    throw new Error(`HTTP request error: ${error.message}`)
  }
}
/**
 * Get the exchange rates for a given symbol against all other symbols.
 * Returned rates define the exchange rates for one unit of the given symbol in terms of other symbols.
 * @param {string} symbol - Symbol of the currency/token
 * @returns {Promise<Object>} - Promise that resolves with the exchange rates object
 */
const getExchangeRatesFor = async (symbol) => {
  const requestUrl = `${BASE_URL}${symbol}`
  try {
    const response = await axios.get(requestUrl)
    return response.data.data.rates
  } catch (error) {
    throw new Error(`HTTP request error: ${error.message}`)
  }
}

/**
 * Utility function to convert USD amount to a specified cryptocurrency in the Ethereum Virtual Machine (EVM).
 *
 * @param {number|string} usdAmount - Amount in USD to convert.
 * @param {string} exchangeRate - Exchange rate for 1 USD in the target cryptocurrency (in ETH).
 * @returns {string} - Converted amount in the target cryptocurrency.
 */
function convertUSDToCrypto (usdAmount, exchangeRate) {
  // Convert the exchange rate and USD amount to Wei
  const exchangeRateWei = Web3.utils.toWei(exchangeRate.toString(), 'ether')
  const usdAmountWei = Web3.utils.toWei(usdAmount.toString(), 'ether')
  // Prepare one eth worth of wei which we will use to divide eth amount
  const oneETHWei = Web3.utils.toWei('1', 'ether')

  // Create a BN instance for the exchange rate in Wei
  const exchangeRateBN = Web3.utils.toBN(exchangeRateWei)
  const usdAmountBN = Web3.utils.toBN(usdAmountWei)
  const oneETHWeiBN = Web3.utils.toBN(oneETHWei)

  // Multiply the USD amount by the exchange rate then divide by 1 ETH equivalent of WEI since we also converted usdAmount to WEI
  const ethAmountBN = exchangeRateBN.mul(Web3.utils.toBN(usdAmountBN)).div(oneETHWeiBN)

  // Convert the result back to Ether and return as a string
  return Web3.utils.fromWei(ethAmountBN.toString())
}

module.exports = {
  getExchangeRateBetween,
  getExchangeRatesFor,
  convertUSDToCrypto
}
