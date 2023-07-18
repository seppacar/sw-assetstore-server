const sharp = require('sharp')

/**
 * Watermarks an image with a given watermark image.
 *
 * @param {string} inputPath - The path to the input image file.
 * @param {string} watermarkPath - The path to the watermark image file.
 * @param {string} outputPath - The path to save the watermarked image.
 * @param {Number} quality - The quality percentage of the output image between 0 and 100
 */
async function watermarkImage (inputPath, watermarkPath, outputPath, quality) {
  try {
    const inputImage = sharp(inputPath)
    const watermarkImage = sharp(watermarkPath)

    // Retrieve metadata of the input image
    const inputMetadata = await inputImage.metadata()

    // Resize the watermark image to match the width of the input image
    const resizedWatermark = await watermarkImage.resize({
      width: inputMetadata.width
    })

    await inputImage
      .composite([{ input: await resizedWatermark.toBuffer(), gravity: 'center' }])
      .toFile(outputPath, { quality })

    console.log('Image watermarked successfully.')
  } catch (error) {
    console.error('Error watermarking image:', error)
  }
}

/**
 * Generates a thumbnail image with the specified dimensions.
 *
 * @param {string} inputPath - The path to the input image file.
 * @param {string} outputPath - The path to the thumbnail image.
 * @param {number} width - The desired width of the thumbnail.
 * @param {number} height - The desired height of the thumbnail.
 */
async function generateImageThumbnail (inputPath, outputPath, width, height) {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
        gravity: sharp.gravity.center
      })
      .toFormat('webp')
      .toFile(outputPath)

    console.log('Thumbnail image generated successfully.')
  } catch (error) {
    console.error('Error generating thumbnail:', error)
  }
}
/**
 * Get metadata of an image.
 *
 * @param {string} imagePath - The path to the image file.
 */
async function getImageMetadata (imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata()
    // Retrieve more metadata properties as needed

    return metadata
  } catch (error) {
    console.error('Error getting image metadata:', error)
    return null
  }
}

module.exports = {
  watermarkImage,
  generateImageThumbnail,
  getImageMetadata
}
