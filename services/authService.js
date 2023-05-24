const User = require('../models/user.model')
const BlacklistedToken = require('../models/blacklistedToken.model')

const login = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  if (!user.validPassword(password)) {
    throw new Error('Invalid email or password')
  }

  const token = user.generateJWT()
  return { token }
}

const logout = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid token')
  }
  const token = authHeader.substring(7) // Remove 'Bearer ' to extract the token

  try {
    const blacklistedToken = new BlacklistedToken({ token })
    await blacklistedToken.save()
    return 'User logged out successfully'
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User already logged out')
    }
    throw new Error('Failed to logout might be server error')
  }
}

const signUp = async (username, email, password) => {
  const role = 'user'
  const newUser = new User({ username, email, password, role })
  newUser.setPassword(password)
  await newUser.save()

  return newUser
}
module.exports = {
  login,
  logout,
  signUp
}
