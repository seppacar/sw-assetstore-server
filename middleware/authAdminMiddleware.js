const jwt = require('jsonwebtoken')
const config = require('../config')
const BlacklistedToken = require('../models/blacklistedToken.model')

const adminAuthMiddleware = async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authorization denied, no token provided' })
  }
  const token = authHeader.substring(7)

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'Authorization denied, no token provided' })
  }
  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET)

    // Check for blacklisted token
    const blacklistedToken = await BlacklistedToken.findOne({ token })
    if (blacklistedToken) {
      return res.status(401).json({ msg: 'Authorization denied, token blacklisted' })
    }

    // Check user role
    if (decoded.role !== 'admin') {
      return res.status(401).json({ msg: 'Authorization denied, user is not an admin' })
    }
    // Add user from payload to request object
    req.user = decoded

    // Call next middleware
    next()
  } catch (err) {
    res.status(401).json({ msg: 'Authorization denied, invalid token' })
  }
}

module.exports = adminAuthMiddleware
