const multer = require('multer')
const path = require('path')

// Initalize storageEngine for multer destination is temporary
const storageEngine = multer.diskStorage({
  destination: './uploads/assets/temp',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 504857600 },
  // fileFilter: (req, file, cb) => {
  //   checkFileType(file, cb)
  // }
})

// // Check allowed filetypes
// const checkFileType = function (file, cb) {
//   // Allowed file extensions
//   const fileTypes = /jpeg|jpg|png|gif|svg/

//   // check extension names
//   const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())

//   const mimeType = fileTypes.test(file.mimetype)

//   if (mimeType && extName) {
//     return cb(null, true)
//   } else {
//     cb(new Error('Error: You can Only Upload Images!!'))
//   }
// }

module.exports = upload
