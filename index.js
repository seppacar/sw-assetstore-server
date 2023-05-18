const app = require('./app') // the actual Express application
const http = require('http') //
const config = require('./config')
const logger = require('./utils/logger')

const httpServer = http.createServer(app)
// HTTPS Configuration
// const httpsServer = https.createServer(credinentals, app)

httpServer.listen(config.serverConfig.PORT, () => {
  logger.info(`Server running on port ${config.serverConfig.PORT}`)
})

// HTTPS TODO:
// httpsServer.listen(443, () => {
// 	console.log('HTTPS Server running on port 443');
// });
