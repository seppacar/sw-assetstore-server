const assetController = require('../../controllers/asset.controller')
const { authStandardUserMiddleware, authAdminMiddleware, authSellerUserMiddleware } = require('../../middleware')
const assetRouter = require('express').Router()
const upload = require('../../middleware/uploadAssetMiddleware')

// TODO: Make this route admin and create other route for get all asset presentation
assetRouter
  .route('/')
  .get(authStandardUserMiddleware, assetController.getAllAssets)
  // TODO: Create a endpoint which return all assets presentation discluding the ones user has
assetRouter
  .route('/presentations')
  .get(authStandardUserMiddleware, assetController.getAllAssetsPresentation)
assetRouter
  .route('/:id')
  .get(authAdminMiddleware, assetController.getAssetById)
  .delete(authAdminMiddleware, assetController.deleteAssetById)
assetRouter
  .route('/:id/presentation')
  .get(authStandardUserMiddleware, assetController.getAssetPresentation)
assetRouter
  .route('/upload')
  .post(authSellerUserMiddleware, upload.single('file'), assetController.createAsset)

module.exports = assetRouter
