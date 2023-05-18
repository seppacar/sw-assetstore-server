require('dotenv').config()

const SERVER_CONFIG = {
  // The port number that the server will listen on
  PORT: process.env.PORT || 5000,
  // The base URL of the server
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
  // Enable CORS (Cross-Origin Resource Sharing) for all routes
  CORS: true,
  // Enable logging for all HTTP requests and responses
  LOGGING: true,
  // Enable gzip compression for all HTTP responses
  COMPRESSION: true,
  // Enable rate limiting for all HTTP requests to prevent abuse
  RATE_LIMIT: {
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests. Please try again later.'
  },
  // Enable HTTPS (Secure HTTP) for all connections
  HTTPS: {
    enabled: false,
    key: '',
    cert: ''
  },
  // Enable HTTP/2 for all connections
  HTTP2: {
    enabled: false,
    key: '',
    cert: ''
  },
  // Enable caching for all HTTP responses to improve performance
  CACHE: {
    enabled: true,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}

module.exports = SERVER_CONFIG
