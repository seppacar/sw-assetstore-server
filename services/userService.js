const User = require('../models/user.model')

const createUser = async (username, email, password) => {
  const newUser = new User({ username, email })
  newUser.setPassword(password)
  await newUser.save()

  return newUser
}

const getAllUsers = async () => {
  return await User.find({})
}

const getUserById = async (id) => {
  const user = await User.findById(id)
  if (!user) {
    throw new Error('User not found')
  }

  return user
}

const updateUserById = async (id, userData) => {
  const userToUpdate = await User.findById(id)
  if (!userToUpdate) {
    throw new Error('User not found')
  }
  const { username, email, tel, password, role } = userData
  if (username) userToUpdate.username = username
  if (email) userToUpdate.email = email
  if (tel) userToUpdate.tel = tel
  if (password) userToUpdate.setPassword(password)
  if (role) userToUpdate.role = role
  await userToUpdate.save()

  return userToUpdate
}

const deleteUserById = async (id) => {
  const deletedUser = await User.findOneAndDelete({ _id: id })
  if (!deletedUser) {
    const error = new Error('User not found')
    error.status = 404
    throw error
  }

  return deletedUser
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById
}
