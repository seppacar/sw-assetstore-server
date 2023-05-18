const User = require('../models/user.model')

const createUser = async (req, res) => {
  const { username, email, password } = req.body
  const newUser = new User({ username, email })
  newUser.setPassword(password)
  await newUser.save()
  return res.json(newUser.toAuthJSON())
}

const getUserById = async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id)
  return res.json(user)
}

const getAllUsers = async (req, res) => {
  const users = await User.find({})
  return res.json(users)
}

// TODO: Think about user model and unchangeable fields later
const updateUserById = async (req, res) => {
  const { id } = req.params
  const { username, email, tel, password, role } = req.body
  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (username) user.username = username
  if (email) user.email = email
  if (tel) user.tel = tel
  if (password) user.setPassword(password)
  if (role) user.role = role
  await user.save()

  return res.json(user)
}

const deleteUserById = async (req, res) => {
  const { id } = req.params
  const deletedUser = await User.findOneAndDelete({ _id: id })
  if (!deletedUser) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json({ message: 'User deleted successfully' })
}

const getOwnedAssets = async (req, res) => {
  const { id } = req.params
  // Check if maker of the request is owner of the user id passed through params or the role is admin
  // BIG TODO:
  if (id === req.user.id) {
    const user = await User.findById(req.user.id, 'ownedAssets').populate('ownedAssets.assetId')

    res.json(user)
  } else {
    res.json('Something fishy going on here 🤔')
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getOwnedAssets
}
