const ffmpeg = require('fluent-ffmpeg')

// Constants
const { VIDEO_RESOLUTIONS } = require('../constants/videoResolutions')

/**
 * Watermarks a video with a given watermark image and optionally downscale it.
 *
 * @param {string} videoPath - The path to the input video file.
 * @param {string} watermarkImagePath - The path to the watermark image file.
 * @param {string} outputPath - The path to save the watermarked video.
 * @param {number} timeoutMinutes - The maximum time limit for the watermarking process in minutes. Pass 0 for no timeout.
 * @returns {Promise<void>} A promise that resolves when the video is watermarked successfully.
 */
async function watermarkVideo (videoPath, watermarkImagePath, outputPath, downscale, timeoutMinutes = 0) {
  const timeoutMs = timeoutMinutes * 60000 // Convert minutes to milliseconds
  return new Promise((resolve, reject) => {
    const command = ffmpeg(videoPath)
      .input(watermarkImagePath)
      .complexFilter([
        '[1:v]scale=iw*0.9:-1[scaled]', // Scale watermark image width to 90% of the video width while maintaining aspect ratio
        '[0:v][scaled]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
      ])
      .output(outputPath)
      .outputOptions('-c:v', 'libvpx')
      .outputOptions('-c:a', 'libvorbis')
      .outputOptions('-f', 'webm')
      .on('progress', (progress) => {
        const percent = Math.round(progress.percent)
        console.log(`Watermarking progress: ${percent}%`)
      })
      .on('end', () => {
        console.log('Watermark added to video successfully!')
        resolve()
      })
      .on('error', (error) => {
        console.error('Error watermarking video:', error)
        reject(error)
      })

    if (timeoutMs > 0) {
      command.on('start', () => {
        setTimeout(() => {
          command.kill()
          reject(new Error(`Watermarking process timed out after ${timeoutMinutes}min.`))
        }, timeoutMs)
      })
    }

    command.run()
  })
}

/**
 * Generates a thumbnail image for a given video.
 *
 * @param {string} videoPath - The path to the input video file.
 * @param {string} outputPath - The file path to save the thumbnail image.
 * @param {number} width - The desired width of the thumbnail image.
 * @param {number} height - The desired height of the thumbnail image.
 * @returns {Promise<void>} A promise that resolves when the thumbnail image is generated successfully.
 */
async function generateVideoThumbnail (videoPath, outputPath, width, height) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', () => {
        console.log('Thumbnail image generated successfully.')
        resolve(outputPath)
      })
      .on('error', (error) => {
        console.error('Error generating thumbnail:', error)
        reject(error)
      })
      .outputOptions('-vf', `thumbnail,scale='min(${width},iw)':'min(${height},ih)')`)
      .outputOptions('-vframes', '1')
      .outputOptions('-c:v', 'webp')
      .outputOptions('-q:v', '2')
      .output(outputPath)
      .run()
  })
}

/**
 * Downscale a video to a specific resolution.
 * @param {string} originalVideoPath - The path to the original video file.
 * @param {string} outputPath - The path to save the downscaled video file.
 * @param {string} resolutionString - The desired resolution in the "widthxheight" format.
 * @returns {Promise<string>} A promise that resolves with the output file path if successful.
 */
async function downscaleVideo (originalVideoPath, outputPath, resolutionString) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(originalVideoPath)
      .outputOptions('-vf', `scale=${resolutionString}`)
      .output(outputPath)
      .on('start', (commandLine) => console.log('Working on:', outputPath))
      .on('progress', (progress) => console.log('Progress:', Math.floor(progress.percent) + '%'))
      .on('end', () => {
        console.log('Completed:', outputPath)
        resolve(outputPath)
      })
      .on('error', (err) => reject(err))

    command.run()
  })
}

/**
 * Retrieves metadata information for a video file.
 *
 * @param {string} videoPath - The path to the video file.
 * @returns {Promise<Object>} A promise that resolves to an object containing the metadata of the video.
 */
async function getVideoMetadata (videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      resolve(metadata)
    })
  })
}

async function getVideoResolution (videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
      if (!videoStream) {
        reject(new Error('No video stream found'))
        return
      }

      const resolution = {
        width: videoStream.width,
        height: videoStream.height
      }

      resolve(resolution)
    })
  })
}

function getDownscaleResolutions (width, height) {
  const resolution = `${width}x${height}`

  if (VIDEO_RESOLUTIONS.hasOwnProperty(resolution)) {
    const resolutionObj = VIDEO_RESOLUTIONS[resolution]
    const { name, downscale } = resolutionObj
    return { name, downscale }
  }
  return null
}

function getVideoResolutionString (width, height) {
  const isVertical = height > width
  if ((width >= 7680 && height >= 4320) || (isVertical && height >= 4320)) {
    return '8K'
  } else if ((width >= 3840 && height >= 2160) || (isVertical && height >= 2160)) {
    return '4K'
  } else if ((width >= 2560 && height >= 1440) || (isVertical && height >= 1440)) {
    return '2K'
  } else if ((width >= 1920 && height >= 1080) || (isVertical && height >= 1080)) {
    return 'FHD'
  } else if ((width >= 1280 && height >= 720) || (isVertical && height >= 720)) {
    return 'HD'
  } else {
    return 'SD'
  }
}

module.exports = {
  watermarkVideo,
  generateVideoThumbnail,
  downscaleVideo,
  getVideoMetadata,
  getVideoResolution,
  getDownscaleResolutions,
  getVideoResolutionString
}
