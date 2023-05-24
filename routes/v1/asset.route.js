const assetController = require('../../controllers/asset.controller')
const { authUserMiddleware, authAdminMiddleware } = require('../../middleware')
const assetRouter = require('express').Router()
const upload = require('../../middleware/uploadAssetMiddleware')

// TODO: Make this route admin and create other route for get all asset presentation
assetRouter
  .route('/')
  .get(assetController.getAllAssets)
  // TODO: Create a endpoint which return all assets presentation discluding the ones user has
assetRouter
  .route('/presentations')
  .get(assetController.getAllAssetsPresentation)
assetRouter
  .route('/:id')
  .get(authAdminMiddleware, assetController.getAssetById)
assetRouter
  .route('/upload')
  .post(authUserMiddleware, upload.single('file'), assetController.createAsset)
assetRouter
  .route('/:id/presentation')
  .get(assetController.getAssetPresentation)

module.exports = assetRouter
