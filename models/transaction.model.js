const mongoose = require('mongoose')

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
  /**
   * The ID of the associated order for this transaction.
   */
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  /**
   * The method used for the transaction.
   * Possible values: 'creditCard', 'blockchain'.
   */
  method: {
    type: String,
    enum: ['creditCard', 'blockchain'],
    required: true
  },
  /**
   * Additional data for blockchain transactions.
   */
  data: {
    /**
     * The chain ID of the blockchain.
     * Required when `method` is set to 'blockchain'.
     */
    chainId: {
      type: String,
      required: function () {
        return this.method === 'blockchain'
      }
    },
    /**
     * The name of the blockchain.
     * Required when `method` is set to 'blockchain'.
     */
    chainName: {
      type: String,
      required: function () {
        return this.method === 'blockchain'
      }
    },
    /**
     * The unique transaction hash for blockchain transactions.
     * Required when `method` is set to 'blockchain'.
     */
    transactionHash: {
      type: String,
      unique: true,
      required: function () {
        return this.method === 'blockchain'
      }
    }
  },
  /**
   * The status of the transaction.
   * Possible values: 'pending', 'confirmed', 'cancelled'.
   * Default: 'pending'.
   */
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  /**
   * The timestamp when the transaction was created.
   * Default: Current date and time.
   */
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Create the Transaction model using the order schema
const Transaction = mongoose.model('Transaction', transactionSchema)

// Export the Transaction model
module.exports = Transaction
