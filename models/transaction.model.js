const mongoose = require('mongoose')

// Define the order schema
const transactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  method: {
    type: String,
    enum: ['creditCard', 'blockchain'],
    required: true
  },
  data: {
    chainId: {
      type: String,
      required: function () {
        return this.method === 'blockchain'
      }
    },
    chainName: {
      type: String,
      required: function () {
        return this.method === 'blockchain'
      }
    },
    transactionHash: {
      type: String,
      unique: true,
      required: function () {
        return this.method === 'blockchain'
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now // Set default createdAt to current date and time
  }
})

// Create the Transaction model using the order schema
const Transaction = mongoose.model('Transaction', transactionSchema)

// Export the Transaction model
module.exports = Transaction
