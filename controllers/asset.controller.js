// TODO: Check file paths use dynamic
const assetService = require('../services/assetService')

const Asset = require('../models/asset.model')

const getAllAssets = async (req, res) => {
  const assets = await Asset.find({})
  res.json(assets)
}
const createAsset = async (req, res) => {
  const newAsset = await assetService.createAsset(req)
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
