// Core Modules
const fs = require('fs')
const path = require('path')

// Third-Party Libraries
const ffmpeg = require('fluent-ffmpeg')

// Constants
const { IMAGE_TIERS, VIDEO_TIERS } = require('../constants/assetTiers')

// Models
const Asset = require('../models/asset.model')
const User = require('../models/user.model')
const { addOwnedAssetAsCreator } = require('./userService')
const { watermarkImage, generateImageThumbnail, getImageMetadata } = require('../utils/imageUtils')
const { watermarkVideo, generateVideoThumbnail, getVideoMetadata, getVideoResolution, getDownscaleResolutions, getVideoResolutionString, downscaleVideo } = require('../utils/videoUtils')

// Watermark Image Path
const watermarkImagePath = './assets/watermark.png'

/**
 * Creates a new asset.
 * @param {Object} req - The request object containing the file and body data.
 * @returns {Promise<Object>} The newly created asset object.
 * @throws {Error} If there is an error during asset creation.
 */
const createAsset = async (req) => {
  const { mimetype } = req.file
  const { assetData } = req.body
  const assetDataObject = JSON.parse(assetData)

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
    title: assetDataObject.title,
    description: assetDataObject.description,
    type: assetType, // TODO: Get file type from user?
    mimeType: mimetype,
    tiers: assetDataObject.tiers,
    createdBy: {
      userId: req.user.id,
      username: req.user.username
    },
    tags: assetDataObject.tags
  })
  // // Rename the uploaded file to the new asset ID with its extension
  // const extension = path.extname(req.file.originalname)
  // const newFilename = newAsset.id + extension
  // // Move uploaded file to ./uploads/assets/original folder
  // fs.renameSync(req.file.path, path.join('uploads', 'assets', 'original', newFilename))
  // // Set the URL of the uploaded file in the database
  // newAsset.originalUrl = `/uploads/assets/original/${newFilename}`

  // const presentationFilename = newFilename.replace(extension, `_presentation${extension}`)

  // Store file extension
  const fileExtension = path.extname(req.file.originalname)

  if (assetType === 'image') {
    // Generate Original Image File Name and Generate original image path
    const originalImageFilename = newAsset.id + fileExtension
    // ./uploads/assets/original folder
    const originalImagePath = path.join('uploads', 'assets', 'original', originalImageFilename)
    // Move uploaded file to originalImagePath
    fs.renameSync(req.file.path, originalImagePath)
    // Generate presentation filename and generate path
    const presentationFilename = originalImageFilename.replace(fileExtension, `_presentation${fileExtension}`)
    const presentationPath = path.join('uploads', 'assets', 'presentation', presentationFilename)
    // Watermark image and store to the presentation path
    await watermarkImage(originalImagePath, watermarkImagePath, presentationPath, 75)
    newAsset.presentationPath = presentationPath
    // Generate Thumbnail filename and store to the thumbnail path in webp format
    const thumbnailFilename = originalImageFilename.replace(fileExtension, `_thumbnail${'.webp'}`)
    const thumbnailPath = path.join('uploads', 'assets', 'thumbnail', thumbnailFilename)
    // Generate thumbnail from image and store to the thumbnailpath
    await generateImageThumbnail(originalImagePath, thumbnailPath, 300, 150)
    newAsset.thumbnailImagePath = thumbnailPath

    const imageTiers = assetDataObject.tiers.filter((tier) => {
      return IMAGE_TIERS.includes(tier.name)
    }).map((tier) => {
      return {
        name: tier.name,
        price: tier.price,
        currency: tier.currency,
        path: originalImagePath // Set the desired path value for the 'Standard' tier
      }
    })
    newAsset.tiers = imageTiers
    // Get Image Metadata and assign to newAsset object
    const imageMetadata = await getImageMetadata(originalImagePath)
    newAsset.metadata = imageMetadata
  } else if (assetType === 'video') {
    // Get video resolution {width: , height: }
    const originalResolution = await getVideoResolution(req.file.path)
    const originalResolutionString = getVideoResolutionString(originalResolution.width, originalResolution.height) // '4K', 'FHD', 'HD', 'SD' etc
    const downscaleResolutions = getDownscaleResolutions(originalResolution.width, originalResolution.height)
    if ((!downscaleResolutions) || (originalResolutionString === downscaleResolutions.name)) {
      // Store original video here first
      const originalVideoFilename = newAsset.id + '_' + originalResolutionString + fileExtension
      const originalVideoPath = path.join('uploads', 'assets', 'original', originalVideoFilename)
      fs.renameSync(req.file.path, originalVideoPath)

      // Initalize original resolution tier and file path initially
      const videoTiers = {
        [originalResolutionString]: {
          resolution: `${originalResolution.width}x${originalResolution.height}`,
          path: originalVideoPath
        }
      }
      // If there is no downscaleable resolution store original and finish
      if (downscaleResolutions) {
        // Iterate downscaleable resolutions and if VIDEO_TIERS constant includes this tier add to videoTiers
        // Later we will use videoTiers variable to iterate and downscale video to matching tier resolutions
        downscaleResolutions.downscale.forEach(item => {
          if (VIDEO_TIERS.includes(item.name)) {
            videoTiers[item.name] = {
              resolution: item.resolution,
              path: null // Initially null, later we will define
            }
          } else {
            console.log(`${item.name} in downscaleable resolutions not a valid tier please check constants/videoResolutions.js and make sure resolution names matches with constants/assetTiers.js VIDEO_TIERS`)
          }
        })
      }

      // Validate Users Request tiers and Generated Tiers
      // Check if the number of keys in both objects match
      const keysMatch = Object.keys(videoTiers).length === assetDataObject.tiers.length

      // Check if all user input keys exist in videoTiers
      const userInputKeysExist = assetDataObject.tiers.every((input) => videoTiers.hasOwnProperty(input.name))

      // Check if all videoTiers keys exist in user input
      const videoTierKeysExist = Object.keys(videoTiers).every((key) =>
        assetDataObject.tiers.some((input) => input.name === key)
      )

      // Check if both objects have matching keys and names
      const matchingKeysAndNames = keysMatch && userInputKeysExist && videoTierKeysExist
      if (matchingKeysAndNames) {
        console.log('Both objects have matching keys and names. proceed to video processing')
      } else {
        throw new Error("Validation Error: Tiers requested and generated downscale tiers doesn't match if you think this is a server error please contact us.")
      }

      // Downscale video for each tier in videoTiers object
      Object.keys(videoTiers).forEach(async key => {
        // If path is null downscale video and update path, (because we don't want to downscale for original resolution)
        if (videoTiers[key].path === null) {
          const tierFileName = newAsset.id + '_' + key + fileExtension // Asset filename in {assetId}_{assetResolutionName}.{assetFileExtension}
          const tierFilePath = path.join('uploads', 'assets', 'original', tierFileName)
          await downscaleVideo(originalVideoPath, tierFilePath, videoTiers[key].resolution)
          videoTiers[key].path = tierFilePath
        }
      })
      console.log(videoTiers)
      console.log(assetDataObject.tiers)

      // generate tiers object to insert to the asset later
      const newAssetTiersObject = assetDataObject.tiers.filter((tier) => {
        return VIDEO_TIERS.includes(tier.name)
      }).map((tier) => {
        // Check if downscaleable resolutions have the resolution
        return {
          name: tier.name,
          price: tier.price,
          currency: tier.currency,
          path: '231' // Set the desired path value for the 'Standard' tier
        }
      })
    } else {
      // TODO:
      throw new Error("Original resolution of the video doesn't match downscale resolutions")
    }
    return
    // Generate presentation filename and generate path
    // const originalVideoFilename = newAsset.id + fileExtension
    // const presentationFilename = originalVideoFilename.replace(fileExtension, `_presentation${'.webm'}`)
    // const presentationPath = path.join('uploads', 'assets', 'presentation', presentationFilename)
    // // Watermark image and store to the presentation path
    // await watermarkVideo(req.file.path, watermarkImagePath, presentationPath, 60)
    // newAsset.presentationPath = presentationPath
    // // Generate Thumbnail filename and store to the thumbnail path in webp format
    // const thumbnailFilename = originalVideoFilename.replace(fileExtension, `_thumbnail${'.webp'}`)
    // const thumbnailPath = path.join('uploads', 'assets', 'thumbnail', thumbnailFilename)
    // // Generate thumbnail from image and store to the thumbnailpath
    // await generateVideoThumbnail(req.file.path, thumbnailPath, 300, 150)
    // newAsset.thumbnailImagePath = thumbnailPath

    // // Generate tiers
    // const videoTiers = assetDataObject.tiers.filter((tier) => {
    //   return IMAGE_TIERS.includes(tier.name)
    // }).map((tier) => {
    //   console.log('test')
    //   const tierFileName = originalVideoFilename.replace(fileExtension, `_${tier.name}${fileExtension}`)
    //   const tierFilePath = path.join('uploads', 'assets', 'original', tierFileName)
    //   // Move uploaded file to originalImagePath
    //   fs.renameSync(req.file.path, tierFilePath)

    //   return {
    //     name: tier.name,
    //     price: tier.price,
    //     currency: tier.currency,
    //     path: tierFilePath // Set the desired path value for the 'Standard' tier
    //   }
    // })
    // Set newAsset object tiers
    // newAsset.tiers = videoTiers
  } else {
    throw new Error('Wrong file type?')
  }
  console.log(newAsset)

  await newAsset.save()
  // Add asset id to users OwnedAssets array as creator
  newAsset.tiers.map(async (tier) => {
    const assetData = {
      item: newAsset.id,
      tier: tier.name
    }
    await addOwnedAssetAsCreator(req.user.id, assetData)
  })

  return newAsset
}

/**
 * Retrieves all assets.
 * @returns {Promise<Array>} An array of all asset objects.
 */
const getAllAssets = async () => {
  return await Asset.find({})
}

/**
 * Retrieves an asset by its ID.
 * @param {string} assetId - The ID of the asset.
 * @returns {Promise<Object>} The asset object.
 * @throws {Error} If the asset is not found.
 */
const getAssetById = async (assetId) => {
  const asset = await Asset.findById(assetId)
  if (!asset) {
    throw new Error('Asset not found')
  }

  return asset
}

/**
 * Retrieves all asset presentations.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} An array of asset presentation objects.
 */
const getAllAssetsPresentation = async (userId) => {
  const assets = await Asset.find()
  const presentations = assets.map(asset => ({
    id: asset.id,
    presentationUrl: asset.presentationUrl,
    title: asset.title,
    description: asset.description,
    pricing: asset.pricing,
    uploadedBy: asset.uploadedBy,
    uploadedAt: asset.uploadedAt
  }))

  return presentations
}

/**
 * Retrieves an asset presentation by its ID.
 * @param {string} assetId - The ID of the asset.
 * @returns {Promise<Object>} The asset presentation object.
 * @throws {Error} If the asset is not found.
 */
const getAssetPresentation = async (assetId) => {
  const asset = await Asset.findById(assetId)
  if (!asset) {
    throw new Error('Asset not found')
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

  return presentation
}

/**
 * Updates an asset by its ID.
 * @param {string} assetId - The ID of the asset.
 * @param {Object} assetData - The data to update the asset with.
 * @returns {Promise<Object>} The updated asset object.
 * @throws {Error} If there is an error while updating the asset.
 */
const updateAssetById = async (assetId, assetData) => {
  try {
    const updatedAsset = await Asset.findByIdAndUpdate(assetId, assetData, { new: true })
    console.log('Asset updated:', updatedAsset)
    return updatedAsset
  } catch (err) {
    console.log(err)
    throw new Error('Failed to update asset')
  }
}

/**
 * Adds soldTo information to an asset.
 * @param {string} assetId - The ID of the asset.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} The updated asset object.
 * @throws {Error} If the user or asset is not found, or if there is an error while adding the soldTo information.
 */
const addSoldToInfoToAsset = async (assetId, userId) => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const updatedAsset = await Asset.findByIdAndUpdate(assetId, {
      $push: {
        soldTo: {
          userId,
          username: user.username, // Populate the username from the user object
          purchasedAt: new Date()
        }
      }
    }, { new: true })

    return updatedAsset
  } catch (err) {
    throw new Error('Failed to add soldTo information to asset')
  }
}

/**
 * Deletes an asset by its ID.
 * @param {string} assetId - The ID of the asset.
 * @returns {Promise<string>} A success message indicating that the asset has been deleted.
 * @throws {Error} If the asset is not found.
 */
const deleteAssetById = async (assetId) => {
  const deletedAsset = await Asset.findOneAndDelete({ _id: assetId })
  if (!deletedAsset) {
    const error = new Error('Asset not found')
    error.status = 404
    throw error
  }
  return `${deletedAsset.title} deleted successfully`
}

module.exports = {
  createAsset,
  getAllAssets,
  getAssetById,
  getAssetPresentation,
  updateAssetById,
  deleteAssetById,
  getAllAssetsPresentation,
  addSoldToInfoToAsset
}
