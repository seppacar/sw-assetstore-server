const User = require('../models/user.model')

/**
 * Creates a new user.
 * @param {string} username - The username of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @param {string} role - The role of the user.
 * @returns {Promise<object>} The created user object.
 */
const createUser = async (username, email, password, role) => {
  const newUser = new User({ username, email, password, role })
  newUser.setPassword(password)
  await newUser.save()
  return newUser
}

/**
 * Retrieves all users.
 * @returns {Promise<Array<object>>} An array of user objects.
 */
const getAllUsers = async () => {
  return await User.find({})
}

/**
 * Retrieves a user by their ID.
 * @param {string} id - The ID of the user.
 * @returns {Promise<object>} The user object.
 * @throws {Error} If the user is not found.
 */
const getUserById = async (id) => {
  const user = await User.findById(id)
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

/**
 * Updates a user's information by their ID.
 * @param {string} id - The ID of the user.
 * @param {object} userData - The updated user data.
 * @returns {Promise<object>} The updated user object.
 * @throws {Error} If the user is not found.
 */
const updateUserById = async (id, userData) => {
  const userToUpdate = await User.findById(id)
  if (!userToUpdate) {
    throw new Error('User not found')
  }
  Object.entries(userData).forEach(([key, value]) => {
    if (value) {
      if (key === 'password') {
        userToUpdate.setPassword(value)
      } else {
        userToUpdate[key] = value
      }
    }
  })
  await userToUpdate.save()
  return userToUpdate
}

/**
 * Deletes a user by their ID.
 * @param {string} id - The ID of the user.
 * @returns {Promise<object>} The deleted user object.
 * @throws {Error} If the user is not found.
 */
const deleteUserById = async (id) => {
  const deletedUser = await User.findOneAndDelete({ _id: id })
  if (!deletedUser) {
    const error = new Error('User not found')
    error.status = 404
    throw error
  }
  return deletedUser
}

/**
 * Adds an owned asset to a user's collection as a buyer.
 * @param {string} userId - The ID of the user.
 * @param {object} assetData - The data of the asset to add.
 * @throws {Error} If the user is not found or the asset already exists in the user's ownedAssets.
 */
const addOwnedAssetAsBuyer = async (userId, assetData) => {
  const { item, tier } = assetData
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }
  const existingAsset = user.ownedAssets.find(asset => asset.assetId.equals(item) && asset.tier === tier)
  if (existingAsset) {
    throw new Error('Asset with the same assetId and tier already exists in user\'s ownedAssets')
  }
  user.ownedAssets.push({
    assetId: item,
    tier,
    ownershipType: 'purchase'
  })
  await user.save()
}

/**
 * Adds an owned asset to a user's collection as a creator.
 * @param {string} userId - The ID of the user.
 * @param {object} assetData - The data of the asset to add.
 * @throws {Error} If the user is not found.
 */
const addOwnedAssetAsCreator = async (userId, assetData) => {
  const { item, tier } = assetData
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }
  user.ownedAssets.push({
    assetId: item,
    tier,
    ownershipType: 'creation'
  })
  await user.save()
}

/**
 * Retrieves a user's owned assets.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<object>>} An array of owned asset objects.
 */
const getOwnedAssets = async (userId) => {
  const user = await User.findById(userId).populate('ownedAssets.assetId')
  const ownedAssets = await user.ownedAssets
  return ownedAssets.map(asset => ({
    asset: asset.assetId,
    tier: asset.tier,
    ownershipType: asset.ownershipType,
    ownershipDate: asset.ownershipDate
  }))
}

/**
 * Updates the balance of a user.
 * @param {string} userId - The ID of the user.
 * @param {number} amount - The amount to update the balance by. Use positive value for increment and negative value for decrement.
 * @returns {Promise<number>} The updated user balance.
 * @throws {Error} If the user is not found or the balance update fails.
 */
const updateUserBalance = async (userId, amount) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const updatedBalance = await user.updateBalance(amount)
    return updatedBalance
  } catch (error) {
    throw new Error('Failed to update user balance')
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
  addOwnedAssetAsBuyer,
  addOwnedAssetAsCreator,
  getOwnedAssets,
  updateUserBalance
}
