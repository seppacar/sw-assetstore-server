// Import required modules
const mongoose = require('mongoose')
const config = require('../config')
const logger = require('../utils/logger')
const User = require('../models/user.model.js')

// Connect to MongoDB
mongoose
  .connect(config.dbConfig.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
    populateDatabase()
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
  })

// Data to populate the database
const usersData = [
  {
    username: 'admin',
    email: 'admin@saruhanweb.com',
    role: 'admin',
    password: 'admin'
  }
  // Add more user objects or any other data you want to populate
]

// Function to populate the database
async function populateDatabase () {
  try {
    // Clear existing data (optional)
    // await User.deleteMany({})

    // Insert new data
    await Promise.all(
      usersData.map(async (userData) => {
        const { password, ...userFields } = userData
        const user = new User(userFields)
        user.setPassword(password)
        await user.save()
      })
    )

    logger.info('Database populated successfully')
    process.exit(0) // Exit the script with a success status code
  } catch (error) {
    logger.error('Error populating database:', error)
    process.exit(1) // Exit the script with an error status code
  }
}

// Call the populateDatabase function to initiate the population
populateDatabase()
