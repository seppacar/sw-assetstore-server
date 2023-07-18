const authService = require('../services/authService')

const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const authResponse = await authService.login(email, password)
    res.json(authResponse)
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}

const logout = async (req, res) => {
  const authHeader = req.headers.authorization
  try {
    const message = await authService.logout(authHeader)
    res.json({ message })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const signUp = async (req, res) => {
  const { username, email, password } = req.body
  const newUser = await authService.signUp(username, email, password)
  return res.json(newUser.toAuthJSON())
}

module.exports = {
  login,
  logout,
  signUp
}
