import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { userRouter } from './controllers/user.controller'
import { datasetRouter } from './controllers/dataset.controller'
import { gdprRouter } from './controllers/gdpr.controller'
import { recommendationRouter } from './controllers/recommendation.controller'
import { didRouter } from './controllers/did.controller'
import aiRoutes from './routes/ai.routes'
import dataverseRoutes from './routes/dataverse.routes'

import { json, urlencoded } from 'body-parser'
import path from 'path'
import fs from 'fs'

// Initialize Express app
const app = express()

// Load environment variables
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads'

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Configure middleware
app.use(helmet()) // Security headers
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(json({ limit: '5mb' })) // JSON body parsing
app.use(urlencoded({ extended: true })) // URL-encoded body parsing

// Configure logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  // Create a log directory if it doesn't exist
  const logDir = 'logs'
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
  }
  
  // Create a write stream for logs
  const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
  )
  app.use(morgan('combined', { stream: accessLogStream }))
}



// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV
  })
})

// Configure routes
app.use('/api/users', userRouter)
app.use('/api/datasets', datasetRouter)
app.use('/api/dids', didRouter)
app.use('/api/gdpr', gdprRouter)
app.use('/api/recommendations', recommendationRouter)
app.use('/api/ai', aiRoutes)
app.use('/api/dataverse', dataverseRoutes)

// API Documentation route
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    name: 'Sapphire API',
    description: 'GDPR-compliant Decentralised Identifier (DID) system API',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      users: '/api/users',
      datasets: '/api/datasets',
      dids: '/api/dids'
    },
    documentation: 'https://github.com/yourusername/sapphire/blob/main/README.md'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} was not found`
  })
})

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(statusCode).json({
    error: message,
    stack: NODE_ENV === 'development' ? err.stack : undefined
  })
})

export default app
