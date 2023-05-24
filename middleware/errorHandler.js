const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  logger.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted ID' })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ error: err.message })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).send({ error: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).send({ error: 'Token expired' })
  }

  if (err.name === 'AuthError') {
    return res.status(403).send({ error: 'Authentication error' })
  }

  if (err.code === 11000) {
    return res.status(400).send({ error: 'Username or email already exists' })
  }

  if (err.name === 'WrongIdError') {
    return res.status(404).send({ error: 'Wrong ID provided' })
  }
  return res.status(500).send({ error: 'Something went wrong: ' + err.message })
}

module.exports = errorHandler
