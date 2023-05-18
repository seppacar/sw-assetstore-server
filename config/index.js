const dbConfig = require('./db.config')
const serverConfig = require('./server.config')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET

module.exports = {
  serverConfig,
  dbConfig,
  JWT_SECRET
}
