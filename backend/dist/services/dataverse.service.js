"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataverseService = void 0;
const axios_1 = __importDefault(require("axios"));
const did_service_1 = require("./did.service");
const ai_service_1 = require("./ai.service");
/**
 * Service for integrating with Dataverse repositories
 * Provides bidirectional data flow - reading from and writing to Dataverse
 */
class DataverseService {
    constructor(baseUrl = 'https://dataverse.harvard.edu') {
        this.didService = new did_service_1.DIDService();
        this.aiService = new ai_service_1.AIService();
        this.baseUrl = baseUrl;
    }
    /**
     * Create a new dataset in Dataverse with DID integration
     *
     * @param dataverseAlias - Target Dataverse collection alias
     * @param metadata - Dataset metadata
     * @param apiToken - Dataverse API token
     * @param createDID - Whether to create a DID for the dataset
     * @returns Promise resolving to creation response with DID
     */
    async createDataset(dataverseAlias, metadata, apiToken, createDID = true) {
        try {
            // Convert metadata to Dataverse format
            const dataverseMetadata = this.convertToDataverseFormat(metadata);
            // Create dataset in Dataverse
            const dataverseResponse = await this.makeDataverseAPICall(`${this.baseUrl}/api/dataverses/${dataverseAlias}/datasets`, 'POST', {
                datasetVersion: {
                    metadataBlocks: {
                        citation: dataverseMetadata
                    }
                }
            }, apiToken);
            let did;
            let didDocument;
            // Create DID if requested
            if (createDID && dataverseResponse.status === 'OK') {
                did = await this.didService.createDID();
                // Create DID document with Dataverse metadata
                didDocument = await this.didService.createDIDDocument(did);
            }
            return {
                dataverseResponse,
                did,
                didDocument
            };
        }
        catch (error) {
            console.error('Error creating dataset in Dataverse:', error);
            throw error;
        }
    }
    /**
     * Upload a file to an existing Dataverse dataset
     *
     * @param datasetId - Dataset ID or persistent identifier
     * @param fileBuffer - File content as buffer
     * @param fileName - Name of the file
     * @param mimeType - MIME type of the file
     * @param metadata - File metadata
     * @param apiToken - Dataverse API token
     * @param enhanceWithAI - Whether to enhance metadata with AI
     * @returns Promise resolving to upload response
     */
    async uploadFile(datasetId, fileBuffer, fileName, mimeType, metadata, apiToken, enhanceWithAI = true) {
        try {
            let aiEnhancements;
            // Enhance metadata with AI if requested
            if (enhanceWithAI) {
                const tags = await this.aiService.extractTags(fileBuffer, mimeType);
                const enhancedDescription = await this.aiService.generateEnhancedDescription(fileName, metadata.description || '', tags);
                const categories = await this.aiService.suggestCulturalCategories(tags, {
                    filename: fileName,
                    mimeType,
                    originalDescription: metadata.description
                });
                aiEnhancements = {
                    tags,
                    enhancedDescription,
                    categories
                };
                // Update metadata with AI enhancements
                metadata.description = enhancedDescription;
                metadata.categories = [...(metadata.categories || []), ...categories.slice(0, 3)];
            }
            // Prepare form data for Dataverse upload
            const formData = new FormData();
            const blob = new Blob([fileBuffer], { type: mimeType });
            formData.append('file', blob, fileName);
            // Add JSON metadata
            const jsonData = {
                description: metadata.description || '',
                directoryLabel: metadata.directoryLabel || '',
                categories: metadata.categories || [],
                restrict: metadata.restrict || false
            };
            formData.append('jsonData', JSON.stringify(jsonData));
            // Upload to Dataverse
            const response = await axios_1.default.post(`${this.baseUrl}/api/datasets/${datasetId}/add`, formData, {
                headers: {
                    'X-Dataverse-key': apiToken,
                    'Content-Type': 'multipart/form-data'
                },
                maxContentLength: 100 * 1024 * 1024, // 100MB limit
                maxBodyLength: 100 * 1024 * 1024
            });
            return {
                dataverseResponse: response.data,
                aiEnhancements
            };
        }
        catch (error) {
            console.error('Error uploading file to Dataverse:', error);
            throw error;
        }
    }
    /**
     * Sync local dataset with Dataverse
     * Updates an existing Dataverse dataset with local changes
     *
     * @param datasetId - Local dataset ID
     * @param dataverseId - Dataverse dataset ID
     * @param apiToken - Dataverse API token
     * @returns Promise resolving to sync result
     */
    async syncDataset(datasetId, dataverseId, apiToken) {
        try {
            // This would implement bidirectional sync logic
            // For now, this is a placeholder for the sync functionality
            const changes = [];
            const conflicts = [];
            // 1. Fetch current state from Dataverse
            const dataverseDataset = await this.getDatasetMetadata(dataverseId, apiToken);
            // 2. Compare with local dataset
            // (This would require fetching local dataset from database)
            // 3. Identify changes and conflicts
            // (Implementation would compare metadata, files, etc.)
            // 4. Apply non-conflicting changes
            // (Implementation would update Dataverse with local changes)
            return {
                status: 'success',
                changes,
                conflicts
            };
        }
        catch (error) {
            console.error('Error syncing dataset with Dataverse:', error);
            throw error;
        }
    }
    /**
     * Get dataset metadata from Dataverse
     *
     * @param datasetId - Dataset ID or persistent identifier
     * @param apiToken - Dataverse API token (optional for public datasets)
     * @returns Promise resolving to dataset metadata
     */
    async getDatasetMetadata(datasetId, apiToken) {
        try {
            const headers = {};
            if (apiToken) {
                headers['X-Dataverse-key'] = apiToken;
            }
            const response = await axios_1.default.get(`${this.baseUrl}/api/datasets/${datasetId}`, { headers });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching dataset metadata from Dataverse:', error);
            throw error;
        }
    }
    /**
     * Convert internal metadata format to Dataverse citation format
     *
     * @param metadata - Internal metadata object
     * @returns Dataverse-formatted metadata
     */
    convertToDataverseFormat(metadata) {
        return {
            fields: [
                {
                    value: metadata.title,
                    typeClass: 'primitive',
                    multiple: false,
                    typeName: 'title'
                },
                {
                    value: metadata.authors.map(author => (Object.assign(Object.assign({ authorName: {
                            value: author.name,
                            typeClass: 'primitive',
                            multiple: false,
                            typeName: 'authorName'
                        } }, (author.affiliation && {
                        authorAffiliation: {
                            value: author.affiliation,
                            typeClass: 'primitive',
                            multiple: false,
                            typeName: 'authorAffiliation'
                        }
                    })), (author.identifier && {
                        authorIdentifierScheme: {
                            value: 'ORCID',
                            typeClass: 'controlledVocabulary',
                            multiple: false,
                            typeName: 'authorIdentifierScheme'
                        },
                        authorIdentifier: {
                            value: author.identifier,
                            typeClass: 'primitive',
                            multiple: false,
                            typeName: 'authorIdentifier'
                        }
                    })))),
                    typeClass: 'compound',
                    multiple: true,
                    typeName: 'author'
                },
                {
                    value: metadata.contacts.map(contact => (Object.assign({ datasetContactName: {
                            value: contact.name,
                            typeClass: 'primitive',
                            multiple: false,
                            typeName: 'datasetContactName'
                        }, datasetContactEmail: {
                            value: contact.email,
                            typeClass: 'primitive',
                            multiple: false,
                            typeName: 'datasetContactEmail'
                        } }, (contact.affiliation && {
                        datasetContactAffiliation: {
                            value: contact.affiliation,
                            typeClass: 'primitive',
                            multiple: false,
                            typeName: 'datasetContactAffiliation'
                        }
                    })))),
                    typeClass: 'compound',
                    multiple: true,
                    typeName: 'datasetContact'
                },
                {
                    value: [{
                            dsDescriptionValue: {
                                value: metadata.description,
                                typeClass: 'primitive',
                                multiple: false,
                                typeName: 'dsDescriptionValue'
                            }
                        }],
                    typeClass: 'compound',
                    multiple: true,
                    typeName: 'dsDescription'
                },
                {
                    value: metadata.subjects,
                    typeClass: 'controlledVocabulary',
                    multiple: true,
                    typeName: 'subject'
                },
                ...(metadata.kindOfData && metadata.kindOfData.length > 0 ? [{
                        value: metadata.kindOfData,
                        typeClass: 'primitive',
                        multiple: true,
                        typeName: 'kindOfData'
                    }] : []),
                ...(metadata.geographicCoverage && metadata.geographicCoverage.length > 0 ? [{
                        value: metadata.geographicCoverage,
                        typeClass: 'primitive',
                        multiple: true,
                        typeName: 'geographicCoverage'
                    }] : []),
                ...(metadata.language ? [{
                        value: metadata.language,
                        typeClass: 'primitive',
                        multiple: false,
                        typeName: 'language'
                    }] : [])
            ]
        };
    }
    /**
     * Make a direct API call to Dataverse
     *
     * @param url - API endpoint URL
     * @param method - HTTP method
     * @param data - Request body data
     * @param apiToken - Authentication token
     * @returns Promise resolving to API response
     */
    async makeDataverseAPICall(url, method, data, apiToken) {
        try {
            const response = await (0, axios_1.default)({
                method,
                url,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Dataverse-key': apiToken
                },
                data
            });
            return {
                status: 'OK',
                data: response.data.data || response.data
            };
        }
        catch (error) {
            console.error('Dataverse API call failed:', error);
            if (error.response) {
                throw new Error(`Dataverse API error: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
            }
            else {
                throw new Error(`Network error: ${error.message}`);
            }
        }
    }
}
exports.DataverseService = DataverseService;
