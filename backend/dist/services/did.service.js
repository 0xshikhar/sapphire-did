"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIDService = void 0;
// Note: Veramo packages are now dynamically imported to support ES Modules.
const database_service_1 = require("./database.service");
/**
 * Service for managing Decentralized Identifiers (DIDs)
 * Implements W3C DID specifications for creating and resolving DIDs
 */
class DIDService {
    constructor() {
        // Agent is initialized asynchronously via getAgent()
    }
    /**
     * Lazily initializes and returns the Veramo agent.
     * This is necessary to handle the ES Module imports dynamically.
     */
    async getAgent() {
        if (this.agent) {
            return this.agent;
        }
        // Dynamically import Veramo modules
        const { createAgent } = await Promise.resolve().then(() => __importStar(require('@veramo/core')));
        const { DIDManager, MemoryDIDStore } = await Promise.resolve().then(() => __importStar(require('@veramo/did-manager')));
        const { EthrDIDProvider } = await Promise.resolve().then(() => __importStar(require('@veramo/did-provider-ethr')));
        // Initialize Veramo agent for DID operations
        this.agent = createAgent({
            plugins: [
                new DIDManager({
                    store: new MemoryDIDStore(),
                    defaultProvider: 'did:ethr',
                    providers: {
                        'did:ethr': new EthrDIDProvider({
                            defaultKms: 'local',
                            network: process.env.ETH_NETWORK || 'development',
                            rpcUrl: process.env.ETH_RPC_URL || 'http://localhost:8545'
                        })
                    }
                })
            ]
        });
        return this.agent;
    }
    /**
     * Create a new DID
     * @returns Promise with the created DID string
     */
    async createDID() {
        try {
            const agent = await this.getAgent();
            const identifier = await agent.didManagerCreate({
                provider: 'did:ethr',
                alias: `user-${Date.now()}`
            });
            return identifier.did;
        }
        catch (error) {
            console.error('Error creating DID:', error);
            throw new Error('Failed to create DID');
        }
    }
    /**
     * Create a basic DID document for a user
     * @param did The DID string
     * @returns The DID document
     */
    async createDIDDocument(did) {
        return {
            '@context': 'https://www.w3.org/ns/did/v1',
            id: did,
            authentication: [
                {
                    id: `${did}#keys-1`,
                    type: 'Ed25519VerificationKey2018',
                    controller: did,
                    // In a real implementation, we would generate actual keys
                    publicKeyBase58: 'H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV'
                }
            ],
            service: [
                {
                    id: `${did}#sapphire-service`,
                    type: 'SapphireService',
                    serviceEndpoint: 'https://sapphire-api.example.com/users'
                }
            ]
        };
    }
    /**
     * Create a DID document for a dataset
     * @param did The DID string
     * @param dataset The dataset entity
     * @returns The DID document for the dataset
     */
    async createDatasetDIDDocument(did, dataset) {
        const user = await database_service_1.db.user.findUnique({
            where: { id: dataset.ownerId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            '@context': 'https://www.w3.org/ns/did/v1',
            id: did,
            authentication: [
                {
                    id: `${did}#keys-1`,
                    type: 'Ed25519VerificationKey2018',
                    controller: user.did,
                    publicKeyBase58: 'H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV'
                }
            ],
            service: [
                {
                    id: `${did}#dataset-service`,
                    type: 'DatasetMetadataService',
                    serviceEndpoint: `https://sapphire-api.example.com/datasets/${dataset.id}`
                }
            ],
            metadata: {
                title: dataset.title,
                description: dataset.description,
                createdBy: user.did,
                createdAt: dataset.createdAt.toISOString(),
                type: 'CulturalHeritageDataset'
            }
        };
    }
    /**
     * Resolve a DID to its DID document
     * @param did The DID to resolve
     * @returns The resolved DID document
     */
    async resolveDID(did) {
        try {
            // First try to get from our database
            const didDoc = await database_service_1.db.dIDDocument.findFirst({
                where: { did, isActive: true },
                orderBy: { version: 'desc' }
            });
            if (didDoc) {
                return didDoc.document;
            }
            // If not found, try to resolve via the DID method
            const agent = await this.getAgent();
            return await agent.resolveDid({ didUrl: did });
        }
        catch (error) {
            console.error('Error resolving DID:', error);
            throw new Error('Failed to resolve DID');
        }
    }
    /**
     * Update an existing DID document
     * @param did The DID to update
     * @param document The new DID document
     * @param userId The user performing the update
     */
    async updateDIDDocument(did, document, userId) {
        // Find the current document to get its version
        const currentDoc = await database_service_1.db.dIDDocument.findFirst({
            where: { did, isActive: true },
            orderBy: { version: 'desc' }
        });
        if (!currentDoc) {
            throw new Error('DID document not found');
        }
        // Verify ownership
        if (currentDoc.userId !== userId) {
            throw new Error('Not authorized to update this DID document');
        }
        // Set the old document to inactive
        await database_service_1.db.dIDDocument.update({
            where: { id: currentDoc.id },
            data: { isActive: false }
        });
        // Create a new version
        const newDoc = await database_service_1.db.dIDDocument.create({
            data: {
                did,
                document,
                version: currentDoc.version + 1,
                userId
            }
        });
        return newDoc;
    }
    /**
     * List all DIDs owned by a user
     * @param userId The user ID
     * @returns Array of active DID documents
     */
    async listUserDIDs(userId) {
        const documents = await database_service_1.db.dIDDocument.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        return documents;
    }
    /**
     * Store the first version of a DID document
     * @param did The DID string
     * @param document The DID document
     * @param userId The user ID of the owner
     */
    async storeNewDIDDocument(did, document, userId) {
        try {
            const newDoc = await database_service_1.db.dIDDocument.create({
                data: {
                    did,
                    document,
                    version: 1,
                    userId,
                    isActive: true
                }
            });
            return newDoc;
        }
        catch (error) {
            console.error('Error storing new DID document:', error);
            throw new Error('Failed to store new DID document');
        }
    }
    /**
     * Get the version history of a DID document
     * @param did The DID to get history for
     * @returns Array of DID document versions
     */
    async getDIDHistory(did) {
        try {
            return await database_service_1.db.dIDDocument.findMany({
                where: { did },
                orderBy: { version: 'asc' }
            });
        }
        catch (error) {
            console.error('Error getting DID history:', error);
            throw new Error('Failed to get DID history');
        }
    }
    /**
     * Verify that a user owns a DID
     * @param did The DID to verify
     * @param userId The user ID to check against
     */
    async verifyDIDOwnership(did, userId) {
        const currentDoc = await database_service_1.db.dIDDocument.findFirst({
            where: { did, isActive: true },
            orderBy: { version: 'desc' }
        });
        if (!currentDoc) {
            // If no document, no one owns it yet in our system
            return false;
        }
        return currentDoc.userId === userId;
    }
    /**
     * Add a verification method to a DID document
     * @param did The DID to update
     * @param method The verification method object to add
     * @param userId The user performing the update
     */
    async addVerificationMethod(did, method, userId) {
        const document = await this.resolveDID(did);
        const hasOwnership = await this.verifyDIDOwnership(did, userId);
        if (!hasOwnership) {
            throw new Error('Not authorized to update this DID document');
        }
        if (!document.authentication) {
            document.authentication = [];
        }
        document.authentication.push(method);
        return this.updateDIDDocument(did, document, userId);
    }
    /**
     * Add a service to a DID document
     * @param did The DID to update
     * @param service The service object to add
     * @param userId The user performing the update
     */
    async addService(did, service, userId) {
        const document = await this.resolveDID(did);
        const hasOwnership = await this.verifyDIDOwnership(did, userId);
        if (!hasOwnership) {
            throw new Error('Not authorized to update this DID document');
        }
        if (!document.service) {
            document.service = [];
        }
        document.service.push(service);
        return this.updateDIDDocument(did, document, userId);
    }
    /**
     * Remove a service from a DID document
     * @param did The DID to update
     * @param serviceId The ID of the service to remove
     * @param userId The user performing the update
     */
    async removeService(did, serviceId, userId) {
        const document = await this.resolveDID(did);
        const hasOwnership = await this.verifyDIDOwnership(did, userId);
        if (!hasOwnership) {
            throw new Error('Not authorized to update this DID document');
        }
        if (!document.service || !Array.isArray(document.service)) {
            // No services to remove, return the document as is
            return document;
        }
        const initialServiceCount = document.service.length;
        document.service = document.service.filter((s) => s.id !== serviceId);
        if (document.service.length === initialServiceCount) {
            // For idempotency, we don't throw an error if the service is already gone.
            console.warn(`Service with ID ${serviceId} not found on DID ${did}. No update performed.`);
            return document;
        }
        return this.updateDIDDocument(did, document, userId);
    }
    /**
     * Deactivate a DID
     * @param did The DID to deactivate
     * @param userId The user performing the deactivation
     */
    async deactivateDID(did, userId) {
        const hasOwnership = await this.verifyDIDOwnership(did, userId);
        if (!hasOwnership) {
            throw new Error('Not authorized to deactivate this DID');
        }
        return database_service_1.db.dIDDocument.updateMany({
            where: { did, userId }, // ensure user can only deactivate their own
            data: { isActive: false }
        });
    }
}
exports.DIDService = DIDService;
