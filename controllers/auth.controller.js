const authService = require('../services/authService')

const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const { token } = await authService.login(email, password)
    res.json({ token })
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

module.exports = {
  login,
  logout
}
