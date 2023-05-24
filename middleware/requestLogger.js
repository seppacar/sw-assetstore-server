const logger = require('../utils/logger')

const requestLogger = (req, res, next) => {
  logger.info('Request')
  logger.info('Method: ' + req.method)
  logger.info('Path:   ' + req.path)
  logger.info('Body:   ' + JSON.stringify(req.body))
  logger.info('---')
  next()
}

module.exports = requestLogger
