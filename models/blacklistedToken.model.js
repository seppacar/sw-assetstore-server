/*
*
* This model can be deprecated later if decide to use Redis to store blacklisted tokens
*
*/

const mongoose = require('mongoose')

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1h' // automatically delete token after 1 hour
  }
})

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema)
