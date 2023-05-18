// Mongoose schema definition for Asset model
const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Creator of the order
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }], // Array of asset IDs included in the order
  totalPrice: { type: Number, required: true }, // Total price of the order
  paymentMethod: { type: String, enum: ['creditCard', 'cryptocurrency'], required: true }, // Payment method used for the order
  createdAt: { type: Date, default: Date.now } // Date and time when the order was created
})

module.exports = mongoose.model('Order', OrderSchema)
