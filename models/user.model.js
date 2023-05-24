const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const config = require('../config')

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], unique: true, index: true },
  email: { type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], unique: true, index: true },
  profilePicture: { type: String, lowercase: true, default: null },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  hash: String,
  salt: String,
  ownedAssets: [
    {
      assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }, // ID of the owned bought assets
      ownershipType: {
        type: String,
        enum: ['creator', 'buyer', 'other']
      },
      ownershipDate: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true })

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
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  }
}

module.exports = mongoose.model('User', UserSchema)
