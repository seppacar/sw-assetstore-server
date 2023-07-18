const User = require('../models/user.model')
const BlacklistedToken = require('../models/blacklistedToken.model')

/**
 * Logs in a user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} The authentication JSON object.
 * @throws {Error} If the email or password is invalid.
 */
const login = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  if (!user.validPassword(password)) {
    throw new Error('Invalid email or password')
  }

  const authJSON = user.toAuthJSON()
  return authJSON
}

/**
 * Logs out a user.
 * @param {string} authHeader - The authorization header containing the bearer token.
 * @returns {Promise<string>} A success message indicating successful logout.
 * @throws {Error} If the token is missing or invalid, or if there is an error during logout.
 */
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
    throw new Error('Failed to logout, possibly due to a server error')
  }
}

/**
 * Signs up a new user.
 * @param {string} username - The user's username.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} The newly created user object.
 */
const signUp = async (username, email, password) => {
  const role = 'standardUser'
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
