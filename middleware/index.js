const authUserMiddleware = require('./authUserMiddleware')
const authAdminMiddleware = require('./authAdminMiddleware')
const requestLogger = require('./requestLogger')
const unknownEndpoint = require('./unknownEndpoint')
const errorHandler = require('./errorHandler')
const multer = require('./uploadAssetMiddleware')

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  authUserMiddleware,
  authAdminMiddleware,
  multer
}
