# SapphireDID: Revolutionizing Cultural Heritage Data with DIDs

**A scalable, GDPR-compliant Decentralised Identifier (DID) system for the future of cultural data.**
An open-source, sustainable, user-centric, and GDPR-compliant approach to cultural data management system using DIDs and agentic models  

## Implementation Status by Component (updated)

### 1. Core DID Infrastructure (90% Complete)

| Feature | Status | Notes | Code Implementation |
|---------|--------|-------|---------------------|
| W3C-compliant DID implementation | ✅ Complete | Fully implements W3C DID standards | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/did.service.ts) |
| DID Document Management | ✅ Complete | Create, read, update, deactivate operations implemented | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/did.controller.ts) |
| DID Resolution Service | ✅ Complete | Functional resolver for DID documents | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/did.service.ts#resolveDID) |
| Verification Methods | ✅ Complete | Support for adding/managing verification methods | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/did.controller.ts#verification-methods) |
| DID Services | ✅ Complete | Full lifecycle management of DID services | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/did.controller.ts#services) |
| DID History | ✅ Complete | Version tracking for DID documents | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/did.controller.ts#history) |
| DID Ownership | ✅ Complete | Ownership verification and access control | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/did.service.ts#verifyDIDOwnership) |
| Blockchain Integration | ⚠️ Partial | Basic framework exists, but lacks production blockchain deployment | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/did.service.ts#createDID) |

The DID controller implements a complete set of RESTful APIs following W3C standards, allowing for the creation, management, and resolution of DIDs. The system properly tracks DID document history and implements ownership verification for security. The main gap is in blockchain anchoring - while the system is designed for it - needs lots of improvements.

### 2. Dataverse Integration (90% Complete)

| Feature | Status | Notes | Code Implementation |
|---------|--------|-------|---------------------|
| Harvard Dataverse API Integration | ✅ Complete | Using official `@iqss/dataverse-client-javascript` | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/dataverse.service.ts) |
| Dataset Search & Discovery | ✅ Complete | Full search functionality with filtering | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/dataverse.controller.ts) |
| Metadata Mapping | ✅ Complete | Bidirectional mapping between DIDs and Dataverse metadata | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/dataverse.service.ts#mapMetadata) |
| Dataset Creation | ✅ Complete | Can create datasets with DID integration | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/dataverse.controller.ts#createDataset) |
| File Upload | ✅ Complete | File uploads with metadata enhancement | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/dataverse.controller.ts#uploadFile) |
| Dataset Synchronization | ✅ Complete | Two-way sync between local database and Dataverse | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/dataverse.controller.ts#syncDataset) |
| DOI Integration | ✅ Complete | Mapping DOIs to DIDs | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/dataverse.service.ts#mapDOI) |
| Handle System Integration | ⚠️ Partial | Limited to Harvard Dataverse only | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/dataverse.service.ts) |
| Multi-Dataverse Support | ⚠️ Partial | Limited to Harvard Dataverse only | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/dataverse.service.ts) |

The Dataverse integration is robust and comprehensive, with a complete bidirectional sync system. The project uses the official Dataverse client library and supports dataset creation, file uploads, and metadata synchronization. Current implementation focuses on Harvard Dataverse only.

### 3. GDPR Compliance (90% Complete)

| Feature | Status | Notes | Code Implementation |
|---------|--------|-------|---------------------|
| Consent Management | ✅ Complete | Comprehensive tracking of user consent | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/gdpr.controller.ts#consent) |
| Right to Erasure | ✅ Complete | Full account deletion functionality | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/gdpr.controller.ts#account) |
| Data Portability | ✅ Complete | Complete user data export feature | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/gdpr.controller.ts#export) |
| Access Logging | ✅ Complete | Detailed audit trail for all operations | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/gdpr.service.ts#recordDataAccess) |
| Data Minimization | ✅ Complete | Proper implementation in database structure | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/gdpr.service.ts) |
| Privacy by Design | ✅ Complete | Core principle throughout the architecture | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/gdpr.service.ts) |
| Data Protection | ⚠️ Partial | Basic protections, but lacks encryption at rest | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/gdpr.service.ts#deleteUserData) |


### 4. AI-Powered Features (70% Complete)

| Feature | Status | Notes | Code Implementation |
|---------|--------|-------|---------------------|
| Metadata Enhancement | ✅ Complete | AI-powered description enrichment | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/ai.controller.ts#enhanceDescription) |
| Tag Extraction | ✅ Complete | Automated content analysis for tags | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/ai.controller.ts#extractTags) |
| Cultural Heritage Categories | ✅ Complete | Specialized categorization for cultural data | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/ai.controller.ts#suggestCategories) |
| File Analysis | ✅ Complete | Comprehensive AI-based file analysis | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/ai.controller.ts#analyzeFile) |
| Recommendation System | ⚠️ Partial | Basic recommendations implemented | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/recommendation.controller.ts) |
| Semantic Linking | ❌ Missing | Not implemented yet | N/A |
| Image Analysis | ⚠️ Partial | Basic framework exists | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/ai.service.ts#analyzeImage) |
| Full-text Analysis | ⚠️ Partial | Limited implementation | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/ai.service.ts#analyzeText) |

The AI service includes key features for enhancing metadata, extracting tags, and suggesting cultural heritage categories. It can analyze uploaded files and provide enhanced descriptions. The recommendation system is partially implemented, but more advanced features like semantic linking and comprehensive image analysis need further development.

### 5. User Authentication & Security (95% Complete)

| Feature | Status | Notes | Code Implementation |
|---------|--------|-------|---------------------|
| Wallet-based Authentication | ✅ Complete | SIWE (Sign-In with Ethereum) implemented | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/frontend/src/app/(auth)/login/page.tsx) |
| Email-based Authentication | ✅ Complete | Using Privy implemented | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/frontend/src/app/(auth)/register/page.tsx) |
| JWT Authentication | ✅ Complete | Secure token-based session management | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/user.controller.ts) |
| DID-based Authorization | ✅ Complete | Access control based on DID ownership | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/did.service.ts#verifyDIDOwnership) |
| API Security | ⚠️ Partial | Basic security implemented, lacks rate limiting | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/app.ts) |
| Key Management | ⚠️ Partial | Basic key handling, but needs production-ready solution | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/did.service.ts#createDID) |

JWT tokens are used for session management, and authorization is properly tied to DID ownership. Security enhancements are needed in API protection, key management, and data encryption.

### 6. Technical Architecture (85% Complete)

| Feature | Status | Notes | Code Implementation |
|---------|--------|-------|---------------------|
| Full-stack TypeScript | ✅ Complete | Next.js frontend + Express backend | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/frontend) / [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend) |
| PostgreSQL Database | ✅ Complete | With Prisma ORM integration | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/database.service.ts) |
| RESTful API Design | ✅ Complete | Well-structured endpoints with documentation | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/routes) |
| File Management | ✅ Complete | Secure file upload and storage | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers/dataset.controller.ts) |
| Error Handling | ✅ Complete | Comprehensive error management | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/middleware) |
| Validation | ✅ Complete | Input validation across all endpoints | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/controllers) |
| Logging | ✅ Complete | Detailed logging for operations | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/services/gdpr.service.ts#recordDataAccess) |
| Scalability | ⚠️ Partial | Basic architecture without clustering | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/server.ts) |
| Environment Configuration | ✅ Complete | Proper configuration management | [Link](https://github.com/0xshikhar/sapphire-did/tree/master/backend/src/config) |

We are using a modern TypeScript stack, PostgreSQL database with Prisma ORM, and well-designed RESTful APIs. The system includes proper error handling, validation, and logging. Scalability features like clustering and load balancing would be needed for production deployment.


**The Sapphire implementation has made significant strides in building a functional DID ecosystem with robust integration with Harvard Dataverse, wallet-based authentication, and AI-powered metadata enhancement capabilities. Most core requirements of the project have been implemented, with some areas still requiring further development.**


## 🧩 The Challenge

In the digital age, managing vast amounts of cultural heritage data presents significant challenges:
*   **High Costs:** Creating and maintaining millions of identifiers is expensive.
*   **Lack of User Control:** Users have little say over how their personal metadata is used.
*   **Data Silos:** Centralized systems limit data accessibility and community collaboration.
*   **Privacy Risks:** Ensuring GDPR compliance in large, interconnected systems is complex.

Sapphire addresses these challenges head-on with a decentralized, cost-effective, and privacy-preserving solution.

## ✨ Key Features

*   **🆔 Decentralized Identifiers (DIDs):** At the core of Sapphire is a W3C-compliant DID system. This allows for self-sovereign identity, where users control their own identifiers and associated data without relying on a central authority.
*   **📚 Dataverse Integration:** Seamless integration with Harvard Dataverse, a leading open-source research data repository. Users can link their DIDs to datasets, manage permissions, and enhance metadata.
*   **🔐 GDPR-Compliant by Design:** Sapphire is built from the ground up with privacy in mind. We provide tools for consent management, data portability, and the "right to be forgotten," ensuring full adherence to GDPR principles.
*   **🤖 AI-Powered Metadata:** Utilize AI to enrich and enhance metadata for cultural heritage artifacts, improving discoverability and research value.
*   **⛓️ Wallet-Based Authentication:** Secure, passwordless authentication using blockchain wallets (SIWE - Sign-In with Ethereum), aligning with the principles of decentralization and self-sovereign identity.
*   ** empowering User Control:** A user-friendly dashboard allows individuals to manage their data, control access permissions, and track usage with a transparent audit trail.

## 🏛️ Architecture

Sapphire's architecture is designed for scalability, security, and interoperability.

```
+------------------------+      +-------------------------+      +-----------------------+
|      Frontend UI       |      |      Backend API        |      |      Dataverse        |
| (React, Next.js)       |      |   (Node.js, Express)    |      | (Harvard Dataverse)   |
|                        |      |                         |      |                       |
| - User Dashboard       |      | - DID Controller        |      | - Dataset Storage     |
| - Wallet Auth (SIWE)   |<---->| - Dataverse Service     |<---->| - Data Repository API |
| - Dataverse Search     |      | - AI Service            |      | - Metadata Management |
| - DID Management       |      | - Prisma ORM            |      |                       |
+------------------------+      +-------------------------+      +-----------------------+
                                           |
                                           |
                                           v
+--------------------------------------------------------------------------------------+
|                                     Blockchain Layer                                 |
|                                (Ethereum, Polygon, etc.)                             |
|                                                                                      |
| - DID Registry (Smart Contract)                                                      |
| - Verifiable Credentials                                                             |
+--------------------------------------------------------------------------------------+
```

## 🛠️ Technical Stack

*   **Frontend:** React, Next.js, TypeScript, Tailwind CSS, Ethers.js, SIWE
*   **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
*   **Blockchain:** Ethereum (or any EVM-compatible chain for DIDs)
*   **Integration:** `@iqss/dataverse-client-javascript` for Dataverse API communication.
*   **Deployment:** Vercel (Frontend), Docker (Backend)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   Bun or npm
*   PostgreSQL database
*   A Web3 wallet (e.g., MetaMask)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/0xshikhar/sapphire.git
    cd sapphire
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Edit .env with your database credentials and other settings
    npx prisma migrate dev
    npm run dev
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    cp .env.example .env.local
    # Edit .env.local with your backend API URL
    npm run dev
    ```

The application should now be running on `http://localhost:3000`.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Our mission is to empower users to have true ownership of their digital identity and metadata, while ensuring full compliance with GDPR.

We welcome contributions from the community! Please read our contributing guidelines before submitting a pull request.

---

**SapphireDID** - *Reclaiming our digital heritage, one identifier at a time.*
