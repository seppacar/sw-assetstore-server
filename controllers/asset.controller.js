// TODO: Check file paths use dynamic

const fs = require('fs')
const path = require('path')
// ffmpeg must have installed on the server
const ffmpeg = require('fluent-ffmpeg')

const Asset = require('../models/asset.model')
const User = require('../models/user.model')
// For watermarking the image presentation purposes
const sharp = require('sharp')

const getAllAssets = async (req, res) => {
  const assets = await Asset.find({})
  res.json(assets)
}
const createAsset = async (req, res) => {
  const watermarkPath = './assets/watermark.png' // path to your watermark image
  const { mimetype, size } = req.file
  const { title, description, tags, price } = req.body
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
    const watermarkImage = await sharp(watermarkPath).resize({ width: 300 })
    const inputImage = await sharp(path.join('uploads', 'assets', 'original', newFilename))
    const watermarkedImage = await inputImage.composite([{
      input: await watermarkImage.toBuffer(),
      gravity: 'center'
    }])
    await watermarkedImage.toFile(path.join('uploads', 'assets', 'presentation', presentationFilename))
  } else if (assetType === 'video') {
    // Use fluent-ffmpeg to add the watermark to the video
    ffmpeg(path.join('uploads', 'assets', 'original', newFilename))
      .input(watermarkPath)
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
        console.log('Watermark added to video successfully!')
      })
      .run()
  } else {
    res.status(500).json('wrong file type ??')
  }

  // Set presentation url of the asset and save
  newAsset.presentationUrl = `/uploads/assets/presentation/${presentationFilename}`
  await newAsset.save()

  // Add asset id to users OwnedAssets array as creator
  await User.findByIdAndUpdate(req.user.id, { $push: { ownedAssets: { assetId: newAsset.id, ownershipType: 'creator' } } })
  res.json(newAsset)
}

const getAssetPresentation = async (req, res) => {
  const asset = await Asset.findById(req.params.id)
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' })
  }
  const presentation = {
    id: asset.id,
    presentationUrl: asset.presentationUrl,
    title: asset.title,
    description: asset.description,
    pricing: asset.pricing,
    uploadedBy: asset.uploadedBy,
    uploadedAt: asset.uploadedAt
  }
  res.json({ presentation })
}

const getAssetPresentationBatch = async (req, res) => {
  const objectIds = req.body.objectIds // Assuming the array of object IDs is sent in the request body

  const assets = await Asset.find({ _id: { $in: objectIds } })

  const presentations = assets.map(asset => ({
    presentationUrl: asset.presentationUrl,
    title: asset.title,
    description: asset.description,
    pricing: asset.pricing,
    uploadedBy: asset.uploadedBy,
    uploadedAt: asset.uploadedAt
  }))

  res.json({ presentations })
}

const getOwnedAssetsByUser = async (req, res) => {
  const { id } = req.params
  // Check if maker of the request is owner of the user id passed through params or the role is admin
  // BIG TODO:
  if (id === req.user.id) {
    const ownedAssets = await Asset.find({ 'uploadedBy.userId': id })
    res.json(ownedAssets)
  } else {
    res.json('Something fishy going on here 🤔')
  }
}

module.exports = {
  getAllAssets,
  createAsset,
  getAssetPresentation,
  getAssetPresentationBatch,
  getOwnedAssetsByUser
}
