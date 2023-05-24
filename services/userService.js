const User = require('../models/user.model')

const createUser = async (username, email, password, role) => {
  const newUser = new User({ username, email, password, role })
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

const addOwnedAssetAsBuyer = async (userId, assetId) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }
  // Check if the asset already exists in ownedAssets
  const existingAsset = user.ownedAssets.find(asset => asset.assetId.equals(assetId))
  if (existingAsset) {
    throw new Error('Asset already exists in user\'s ownedAssets')
  }
  // Add the new asset as owner with the ownership type set as "buyer"
  user.ownedAssets.push({
    assetId,
    ownershipType: 'buyer'
  })
  await user.save()
}

const getOwnedAssets = async (userId) => {
  const user = await User.findById(userId).populate('ownedAssets.assetId')

  const ownedAssets = await user.ownedAssets
  // Extract assetId and ownershipType in an array of objects

  return ownedAssets.map(asset => ({
    asset: asset.assetId,
    ownershipType: asset.ownershipType
  }))
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
  addOwnedAssetAsBuyer,
  getOwnedAssets
}
