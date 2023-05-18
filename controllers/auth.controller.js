// const config = require('../config')
// const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const BlacklistedToken = require('../models/blacklistedToken.model')

// Login existing user
const login = async (req, res) => {
  const { email, password } = req.body
  // find user by email
  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  // Check if password is correct
  if (!user.validPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  // Generate and send JWT token
  const token = user.generateJWT()
  res.json({ token })
}

/*
*
* This controller can be changed later if decide to use Redis to store blacklisted tokens
*
*/
const logout = async (req, res) => {
  // Get token from header
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  // Check if token is missing
  if (!token) {
    return res.status(401).json({ message: 'Missing token' })
  }

  // Verify token and get user ID
  // const decodedToken = jwt.verify(token, config.JWT_SECRET)

  // Create new BlacklistToken document with user ID and token
  const blacklistedToken = new BlacklistedToken({ token })

  // Save blacklistToken document to database
  try {
    // Token saved to BlacklistToken document here
    await blacklistedToken.save()
    return res.json({ message: 'User logged out successfully' })
  } catch (err) {
    // If duplicate key error
    if (err.code === 11000) {
      return res.status(401).json({ message: 'User already logged out' })
    }
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  login,
  logout
}
