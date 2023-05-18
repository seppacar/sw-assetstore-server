// Mongoose schema definition for Asset model
const mongoose = require('mongoose')

// Define a new mongoose schema for assets
const AssetSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Name of the asset
  description: { type: String }, // Description of the asset
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'audio', '3d-model', 'document', 'other']
  }, // Type of the asset (image, video, 3D model, etc.)
  mimeType: { type: String, required: true }, // MIME type of the asset
  size: { type: Number, required: true }, // Size of the asset in bytes
  originalUrl: { type: String, required: true }, // URL where original asset is stored
  presentationUrl: { type: String, required: true }, // URL where original asset is stored
  uploadedBy: { // Information about the user who uploaded the asset
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID of the user who uploaded the asset
    username: { type: String } // Username of the user who uploaded the asset
  },
  uploadedAt: { type: Date, default: Date.now }, // Date and time when the asset was uploaded
  soldTo: [{ // Information about the users who most recently bought the asset (if sold)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID of the user who bought the asset
    username: { type: String }, // Username of the user who bought the asset
    purchasedAt: { type: Date, default: Date.now() } // Purchase time of the asset by indivudial user
  }],
  metadata: { type: mongoose.Schema.Types.Mixed }, // Any additional metadata about the asset
  tags: [{ type: String }], // Array of tags eg.('nature', 'landscape', 'mountain')
  views: { type: Number, default: 0 }, // Number of views for the asset
  pricing: { // Pricing information for the asset (if applicable)
    price: { type: Number, default: 0 }, // Price of the asset
    currency: { type: String, default: 'USD' }, // Currency in which the asset is priced
    discounts: [{ // Discounts available for the asset
      code: { type: String }, // Discount code
      percentage: { type: Number }, // Percentage discount
      validUntil: { type: Date } // Expiration date of the discount
    }],
    tiers: [{ // Pricing tiers for the asset
      name: { type: String }, // Name of the tier
      price: { type: Number } // Price of the tier
    }]
  },
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID of the user who rated the asset
    username: { type: String }, // Username of the user who marked the asset as a favorite
    rating: { type: Number, min: 0, max: 5 } // Rating given by the user (eg
  }],
  favorites: [{ // Users who marked the asset as a favorite
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID of the user who marked the asset as a favorite
    username: { type: String } // Username of the user who marked the asset as a favorite
  }],
  status: {
    type: String,
    enum: ['active', 'pending', 'archived'],
    default: 'pending'
  }

})

// Export a new mongoose model for assets using the schema above
module.exports = mongoose.model('Asset', AssetSchema)
