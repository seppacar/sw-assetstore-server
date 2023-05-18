const mongoose = require('mongoose')

// Define the order schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  }],
  payment: {
    amount: {
      type: Number,
      required: true,
      min: 0 // Ensure totalPrice is a non-negative value
    },
    currency: {
      type: String,
      enum: ['USD', 'TRY'],
      default: 'USD'
    },
    method: {
      type: String,
      enum: ['creditCard', 'cryptocurrency'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending' // Set default status to 'pendingPayment'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now // Set default createdAt to current date and time
  }
})

// Create the Order model using the order schema
const Order = mongoose.model('Order', orderSchema)

// Export the Order model
module.exports = Order
