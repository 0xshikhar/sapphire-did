# Sapphire Backend

The backend service for the Sapphire project - a GDPR-compliant Decentralized Identifier (DID) system for cultural heritage data.

## Overview

This backend provides a REST API for managing users, datasets, and decentralized identifiers (DIDs). It integrates with Dataverse and supports W3C DID standards, designed for GDPR compliance and cultural heritage data management.

## Features

- **User Management**: Registration, authentication, profile management
- **Dataset Management**: Upload, metadata extraction, search, permissions
- **DID Management**: Create, resolve, update DIDs following W3C standards
- **GDPR Compliance**: Consent management, data export, right to erasure
- **AI Integration**: Metadata extraction and content classification

## Tech Stack

- Node.js with TypeScript
- Express.js for API routing
- Prisma ORM with SQLite/PostgreSQL
- Veramo for DID management
- JWT for authentication
- Multer for file uploads
- TensorFlow (planned) for AI features

## Prerequisites

- Node.js >= 14.x
- npm >= 7.x
- SQLite or PostgreSQL

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```
4. Update the environment variables in `.env` as needed
5. Set up the database:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Key environment variables include:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret for JWT signing
- `UPLOAD_DIR`: Directory for dataset file storage
- `AI_MODELS_ENABLED`: Toggle for AI model features

See `.env.example` for a complete list of configuration options.

## API Endpoints

### User Management
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/export-data` - Export all user data (GDPR)
- `DELETE /api/users/account` - Delete user account

### Dataset Management
- `POST /api/datasets` - Create a new dataset
- `GET /api/datasets` - List user datasets
- `GET /api/datasets/search` - Search datasets
- `GET /api/datasets/:id` - Get dataset by ID
- `PUT /api/datasets/:id` - Update dataset
- `DELETE /api/datasets/:id` - Delete dataset

### DID Management
- `POST /api/dids` - Create a new DID
- `GET /api/dids/:did` - Resolve DID document
- `GET /api/dids/:did/history` - Get DID history
- `PUT /api/dids/:did` - Update DID document
- `POST /api/dids/:did/verification-methods` - Add verification method
- `POST /api/dids/:did/services` - Add service
- `DELETE /api/dids/:did` - Deactivate DID

## GDPR Features

- Explicit consent collection and management
- Complete data export in portable format
- Right to erasure with anonymization
- Activity logging for data access
- Data minimization practices

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # API route handlers
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/              # Prisma schema and migrations
├── uploads/             # Dataset file storage (gitignored)
├── logs/                # Application logs (gitignored)
└── tests/               # Test files
```

## License

MIT License
