import app from './app'
import dotenv from 'dotenv'
import { DatabaseService } from './services/database.service'

// Load environment variables
dotenv.config()

// DatabaseService is a singleton and initializes itself. No need to create an instance here.

// Define port
const PORT = process.env.PORT || 3000

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  🌟 Sapphire Backend Server Running 🌟
  ➡️ Environment: ${process.env.NODE_ENV || 'development'}
  ➡️ Port: ${PORT}
  ➡️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not Connected'}
  ➡️ API: http://localhost:${PORT}/api/docs
  `)
})

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

export default server
