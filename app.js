const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./config')
const routes = require('./routes/v1')
const middleware = require('./middleware')
const logger = require('./utils/logger')
require('express-async-errors')
// Create express app instance
const app = express()
// Allow requests from the frontend domain
app.use(cors())
// Handle MongoDB Connection Here
mongoose
  .connect(config.dbConfig.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

// Express JSON Parser
app.use(express.json())

// Apply request logger middleware
app.use(middleware.requestLogger)

// Serve presentation folder
app.use('/uploads/assets/presentation', express.static('uploads/assets/presentation'))

app.use('/api', routes)

// Apply error handling middleware
app.use(middleware.errorHandler)
app.use('/api', middleware.unknownEndpoint)

module.exports = app
