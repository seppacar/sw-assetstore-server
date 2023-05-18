const userService = require('../services/userService')

const createUser = async (req, res) => {
  const { username, email, password } = req.body
  const newUser = await userService.createUser(username, email, password)
  return res.json(newUser.toAuthJSON())
}

const getUserById = async (req, res) => {
  const { id } = req.params
  const user = await userService.getUserById(id)
  return res.json(user)
}

const getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers()
  return res.json(users)
}

// TODO: Think about user model and unchangeable fields later
const updateUserById = async (req, res) => {
  const userId = req.params.id
  const userData = req.body
  const updatedUser = await userService.updateUserById(userId, userData)

  return res.json(updatedUser)
}

const deleteUserById = async (req, res) => {
  const { id } = req.params
  const message = await userService.deleteUserById(id)
  res.json({ message })
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
}
