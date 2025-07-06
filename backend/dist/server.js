"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// DatabaseService is a singleton and initializes itself. No need to create an instance here.
// Define port
const PORT = process.env.PORT || 3000;
// Start server
const server = app_1.default.listen(PORT, () => {
    console.log(`
  🌟 Sapphire Backend Server Running 🌟
  ➡️ Environment: ${process.env.NODE_ENV || 'development'}
  ➡️ Port: ${PORT}
  ➡️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not Connected'}
  ➡️ API: http://localhost:${PORT}/api/docs
  `);
});
// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
exports.default = server;
