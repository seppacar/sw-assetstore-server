// TODO: Check file paths use dynamic
const assetService = require('../services/assetService')

const createAsset = async (req, res) => {
  const newAsset = await assetService.createAsset(req)
  res.json(newAsset)
}
const getAllAssets = async (req, res) => {
  const assets = await assetService.getAllAssets()
  res.json(assets)
}

const getAssetById = async (req, res) => {
  const assetId = req.params.id
  const asset = await assetService.getAssetById(assetId)
  res.json(asset)
}
const getAllAssetsPresentation = async (req, res) => {
  const presentations = await assetService.getAllAssetsPresentation()
  res.json(presentations)
}

const getAssetPresentation = async (req, res) => {
  const assetId = req.params.id
  const presentation = await assetService.getAssetPresentation(assetId)
  res.json({ presentation })
}

module.exports = {
  createAsset,
  getAllAssets,
  getAssetById,
  getAllAssetsPresentation,
  getAssetPresentation
}
