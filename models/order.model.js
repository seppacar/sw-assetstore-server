const mongoose = require('mongoose')

// Define the order schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    _id: false,
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true
    },
    tier: {
      type: String,
      required: true,
      default: 'Standard'
    }
  }],
  amount: {
    USD: {
      type: String,
      required: true,
      min: 0
    },
    TRY: {
      type: String,
      required: true,
      min: 0
    },
    ETH: {
      type: String,
      required: true,
      min: 0
    },
    MATIC: {
      type: String,
      required: true,
      min: 0
    },
    AVAX: {
      type: String,
      required: true,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['pendingPayment', 'completed', 'cancelled'],
    default: 'pendingPayment'
  },
  createdAt: {
    type: Date,
    default: Date.now // Set default createdAt to current date and time
  },
  completedAt: {
    type: Date,
    default: null
  }
})

// Create the Order model using the order schema
const Order = mongoose.model('Order', orderSchema)

// Export the Order model
module.exports = Order
