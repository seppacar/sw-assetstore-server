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
  metadata: { type: mongoose.Schema.Types.Mixed }, // Any additional metadata about the asset
  mimeType: { type: String, required: true }, // MIME type of the asset
  presentationPath: { type: String, required: true }, // URL where presentation of the asset is stored
  thumbnailImagePath: { type: String, required: true }, // Thumbnail image of the asset
  tiers: [{
    _id: false,
    name: {
      type: String,
      enum: ['Standard', '8K', '4K', '2K', 'FHD', 'HD', 'SD'],
      required: true
    },
    resolution: { type: String },
    price: { type: Number, default: 0, min: 0 }, // Price of the asset
    currency: { type: String, default: 'USD' }, // Currency in which the asset is priced
    path: { type: String, required: true } // URL where original asset is stored
  }],
  createdBy: { // Information about the user who uploaded the asset
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID of the user who uploaded the asset
    username: { type: String } // Username of the user who uploaded the asset
  },
  createdAt: { type: Date, default: Date.now }, // Date and time when the asset was uploaded
  soldTo: [{ // Information about the users who most recently bought the asset (if sold)
    _id: false,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID of the user who bought the asset
    username: { type: String }, // Username of the user who bought the asset
    purchasedAt: { type: Date, default: Date.now() } // Purchase time of the asset by indivudial user
  }],
  tags: [{ type: String }], // Array of tags eg.('nature', 'landscape', 'mountain')
  views: { type: Number, default: 0 }, // Number of views for the asset
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID of the user who rated the asset
    username: { type: String }, // Username of the user who marked the asset as a favorite
    rating: { type: Number, min: 0, max: 5 } // Rating given by the user (eg
  }],
  status: {
    type: String,
    enum: ['active', 'pending', 'archived'],
    default: 'pending'
  }

})

// Method to increment the view count for an asset
AssetSchema.methods.incrementViews = async function () {
  this.views++ // Increment the views count
  await this.save() // Save the updated asset
}

// Export a new mongoose model for assets using the schema above
module.exports = mongoose.model('Asset', AssetSchema)
