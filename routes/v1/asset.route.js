const assetController = require('../../controllers/asset.controller')
const { authUserMiddleware } = require('../../middleware')
const assetRouter = require('express').Router()
const upload = require('../../middleware/uploadAssetMiddleware')

assetRouter
  .route('/')
  .get(assetController.getAllAssets)
assetRouter
  .route('/upload')
  .post(authUserMiddleware, upload.single('file'), assetController.createAsset)
assetRouter
  .route('/presentation/:id')
  .get(assetController.getAssetPresentation)

assetRouter
  .route('/ownedBy/:id')
  .get(authUserMiddleware, assetController.getOwnedAssetsByUser)

module.exports = assetRouter
