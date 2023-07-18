const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const config = require('../config')

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, required: [true, 'Username is required.'], match: [/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers.'], unique: true, index: true },
  email: { type: String, lowercase: true, required: [true, 'Email is required.'], match: [/\S+@\S+\.\S+/, 'Invalid email format.'], unique: true, index: true },
  profilePicture: { type: String, lowercase: true, default: 'https://cataas.com/cat/says/sw' },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['admin', 'standardUser', 'sellerUser'], default: 'standardUser' },
  walletBalance: { type: Number, min: 0, default: 0, required: true },
  hash: String,
  salt: String,
  ownedAssets: [
    {
      _id: false,
      assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }, // ID of the owned bought assets
      tier: { type: String },
      ownershipType: {
        type: String,
        enum: ['creation', 'purchase', 'mint', 'other']
      },
      ownershipDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    required: true,
    default: 'active'
  }
},
{ timestamps: true })

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
}

UserSchema.methods.validPassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
  return this.hash === hash
}

UserSchema.methods.generateJWT = function () {
  return jwt.sign({
    id: this._id,
    username: this.username,
    role: this.role
  }, config.JWT_SECRET, { expiresIn: '1h' })
}

UserSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    profilePicture: this.profilePicture,
    username: this.username,
    role: this.role,
    email: this.email,
    token: this.generateJWT()
  }
}

// Update method for users wallet balance
UserSchema.statics.updateWalletBalance = async function (userId, amount) {
  try {
    const user = await this.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const updatedUser = await this.findOneAndUpdate(
      { _id: userId },
      { $inc: { walletBalance: amount } },
      { new: true }
    )

    return updatedUser.walletBalance
  } catch (error) {
    throw new Error('Failed to update wallet balance')
  }
}

module.exports = mongoose.model('User', UserSchema)
