const dbConfig = require('./db.config')
const serverConfig = require('./server.config')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET

const ETHEREUM_WALLET_ADDRESS = process.env.ETHEREUM_WALLET_ADDRESS

module.exports = {
  serverConfig,
  dbConfig,
  JWT_SECRET,
  ETHEREUM_WALLET_ADDRESS
}
