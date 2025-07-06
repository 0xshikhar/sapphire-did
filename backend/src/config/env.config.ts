import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Server configuration
export const SERVER_CONFIG = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api'
}

// Database configuration
export const DB_CONFIG = {
  url: process.env.DATABASE_URL || 'file:./dev.db',
  logLevel: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
}

// JWT Authentication configuration
export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'sapphire-dev-secret', // Default for development only
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  saltRounds: 10
}

// DID configuration
export const DID_CONFIG = {
  ethrProvider: process.env.ETHR_PROVIDER || 'http://localhost:8545',
  didMethod: process.env.DID_METHOD || 'did:ethr'
}

// File storage configuration
export const STORAGE_CONFIG = {
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB in bytes
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json'
  ]
}

// AI Service configuration
export const AI_CONFIG = {
  modelsEnabled: process.env.AI_MODELS_ENABLED === 'true',
  modelPath: process.env.AI_MODEL_PATH || './models',
  classificationThreshold: parseFloat(process.env.CLASSIFICATION_THRESHOLD || '0.7'),
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY
}

// GDPR configuration
export const GDPR_CONFIG = {
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '730', 10), // 2 years default
  consentRequiredForAnalytics: process.env.CONSENT_REQUIRED_ANALYTICS === 'true',
  defaultAnonymizationStrategy: process.env.DEFAULT_ANONYMIZATION || 'pseudonymize'
}

// Logging configuration
export const LOGGING_CONFIG = {
  logDir: process.env.LOG_DIR || 'logs',
  logLevel: process.env.LOG_LEVEL || 'info'
}

// Check for missing critical environment variables in production
if (process.env.NODE_ENV === 'production') {
  const missingVars = []
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'sapphire-dev-secret') {
    missingVars.push('JWT_SECRET')
  }
  
  if (!process.env.DATABASE_URL) {
    missingVars.push('DATABASE_URL')
  }
  
  if (missingVars.length > 0) {
    console.error(`Missing critical environment variables: ${missingVars.join(', ')}`)
    console.error('These must be set for production deployment')
    
    // Only exit if in production and missing critical vars
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}

// Warn about missing AI API keys for development
if (AI_CONFIG.modelsEnabled && !AI_CONFIG.openaiApiKey) {
  console.warn('Warning: AI models enabled but OPENAI_API_KEY not found. AI features will use mock data.')
}
