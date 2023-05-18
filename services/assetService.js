// Core Modules
const fs = require('fs')
const path = require('path')

// Third-Party Libraries
const ffmpeg = require('fluent-ffmpeg')
const sharp = require('sharp')

//
const Asset = require('../models/asset.model')
const User = require('../models/user.model')

// Watermark Image Path
const watermarkImagePath = './assets/watermark.png'

const createAsset = async (req) => {
  const { mimetype, size } = req.file
  const { title, description, tags, price } = req.body

  // Set assetType
  let assetType
  if (mimetype.startsWith('image/')) {
    assetType = 'image'
  } else if (mimetype.startsWith('video/')) {
    assetType = 'video'
  } else if (mimetype.startsWith('audio/')) {
    assetType = 'audio'
  } else {
    assetType = 'other'
  }

  // Create a new asset object using the request body data and file information
  const newAsset = new Asset({
    title,
    description,
    type: 'image', // TODO: Get file type from user?
    mimeType: mimetype,
    size,
    url: '', // Set the URL to an empty string for now
    uploadedBy: {
      userId: req.user.id,
      username: req.user.username
    },
    tags,
    pricing: {
      price
    }
  })
  // Rename the uploaded file to the new asset ID with its extension
  const extension = path.extname(req.file.originalname)
  const newFilename = newAsset.id + extension
  // Move uploaded file to ./uploads/assets/original folder
  fs.renameSync(req.file.path, path.join('uploads', 'assets', 'original', newFilename))
  // Set the URL of the uploaded file in the database
  newAsset.originalUrl = `/uploads/assets/original/${newFilename}`

  const presentationFilename = newFilename.replace(extension, `_presentation${extension}`)

  // If the asset is an image watermark the image using sharp library
  if (assetType === 'image') {
    // Watermark the image here then store in /uploads/assets/presentation folder
    // Watermark the image here then store in /uploads/assets/presentation folder
    const watermarkImage = await sharp(watermarkImagePath).resize({ width: 300 })
    const inputImage = await sharp(path.join('uploads', 'assets', 'original', newFilename))
    const watermarkedImage = await inputImage.composite([{
      input: await watermarkImage.toBuffer(),
      gravity: 'center'
    }])
    await watermarkedImage.toFile(path.join('uploads', 'assets', 'presentation', presentationFilename))
  } else if (assetType === 'video') {
    // Use fluent-ffmpeg to add the watermark to the video
    ffmpeg(path.join('uploads', 'assets', 'original', newFilename))
      .input(watermarkImagePath)
      .complexFilter([
        {
          filter: 'overlay',
          options: {
            x: '(W-w)/2', y: '(H-h)/2'
          }
        }
      ])
      .output(path.join('uploads', 'assets', 'presentation', presentationFilename))
      .on('end', async () => {
        // TODO: Do something here to let user image processed successfully
        // Maybe a promise and on ('error') etc
        console.log('Watermark added to video successfully!')
      })
      .run()
  } else {
    throw new Error('Wrong file type?')
  }

  // Set presentation url of the asset and save
  newAsset.presentationUrl = `/uploads/assets/presentation/${presentationFilename}`
  await newAsset.save()

  // Add asset id to users OwnedAssets array as creator
  await User.findByIdAndUpdate(req.user.id, { $push: { ownedAssets: { assetId: newAsset.id, ownershipType: 'creator' } } })

  return newAsset
}

const getAllAssets = async () => {
  return await Asset.find({})
}
const getAssetById = async (assetId) => {
  const asset = await Asset.findById(assetId)
  if (!asset) {
    throw new Error('Asset not found')
  }

  return asset
}

const updateAssetById = async () => {
  return ('todo')
}

const deleteAssetById = async () => {
  return ('todo')
}

module.exports = {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAssetById,
  deleteAssetById
}
