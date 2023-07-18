const authStandardUserMiddleware = require('./authStandardUserMiddleware')
const authSellerUserMiddleware = require('./authSellerUserMiddleware')
const authAdminMiddleware = require('./authAdminMiddleware')
const requestLogger = require('./requestLogger')
const unknownEndpoint = require('./unknownEndpoint')
const errorHandler = require('./errorHandler')
const multer = require('./uploadAssetMiddleware')

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  authStandardUserMiddleware,
  authSellerUserMiddleware,
  authAdminMiddleware,
  multer
}
