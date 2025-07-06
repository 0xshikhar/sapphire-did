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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const papaparse_1 = __importDefault(require("papaparse"));
const axios_1 = __importDefault(require("axios"));
const env_config_1 = require("../config/env.config");
/**
 * Service for AI-powered metadata extraction and content classification
 */
class AIService {
    constructor() {
        this.imageModel = null;
        this.textModel = null;
        // Initialize category tags for different content types
        this.categoryTags = new Map([
            ['image', ['photography', 'artwork', 'diagram', 'chart', 'map', 'portrait', 'landscape', 'historical']],
            ['text', ['article', 'literature', 'research', 'documentation', 'transcription', 'manuscript']],
            ['document', ['report', 'publication', 'catalog', 'archive', 'legal', 'academic', 'historical']],
            ['audio', ['music', 'interview', 'lecture', 'ambient', 'historical', 'recording', 'oral_history']],
            ['video', ['documentary', 'interview', 'presentation', 'performance', 'historical_footage']],
            ['dataset', ['collection', 'survey', 'statistics', 'records', 'catalog_data', 'research_data']],
            ['other', ['mixed_content', 'unknown', 'other']]
        ]);
        // Models will be lazily loaded when needed
        this.loadModels();
    }
    /**
     * Load TensorFlow models in the background
     */
    async loadModels() {
        try {
            // Load models in background to avoid blocking startup
            if (env_config_1.AI_CONFIG.modelsEnabled) {
                console.log('Initializing AI models...');
                // Try to load a basic image classification model
                try {
                    // For demonstration, we'll use MobileNet which can be useful for basic image classification
                    // In production, you would use a custom-trained cultural heritage model
                    const modelPath = path.join(env_config_1.AI_CONFIG.modelPath, 'mobilenet/model.json');
                    if (fs.existsSync(modelPath)) {
                        this.imageModel = await tf.loadLayersModel(`file://${modelPath}`);
                        console.log('Image classification model loaded');
                    }
                    else {
                        console.log('No image model found at', modelPath, '- using fallback classification');
                    }
                }
                catch (modelError) {
                    console.warn('Could not load image model:', modelError instanceof Error ? modelError.message : String(modelError));
                }
                console.log('AI models initialization complete');
            }
            else {
                console.log('AI models disabled by configuration');
            }
        }
        catch (error) {
            console.error('Error loading AI models:', error);
            // Continue without models - we'll fall back to basic classification
        }
    }
    /**
     * Extract tags from a file based on its content and metadata
     * @param fileBuffer The file content as a buffer
     * @param mimeType The MIME type of the file
     * @returns Array of extracted tags
     */
    async extractTags(fileBuffer, mimeType) {
        const category = this.getMimeCategory(mimeType);
        let tags = [];
        // Add base category tag
        tags.push(category);
        // Add sample tags based on file category
        // In a real implementation, we would use AI models to generate these
        const categorySpecificTags = this.categoryTags.get(category) || [];
        // For MVP, randomly select a few tags from the category
        const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags
        const selectedTags = this.getRandomElements(categorySpecificTags, numTags);
        tags = [...tags, ...selectedTags];
        // Try to extract more content-specific tags based on the mime type
        try {
            switch (category) {
                case 'image':
                    if (this.imageModel) {
                        const imageTags = await this.classifyImage(fileBuffer);
                        tags = [...tags, ...imageTags];
                    }
                    break;
                case 'text':
                case 'document':
                    const textContent = fileBuffer.toString('utf-8', 0, Math.min(10000, fileBuffer.length));
                    const textTags = await this.extractTextTags(textContent);
                    tags = [...tags, ...textTags];
                    break;
                case 'dataset':
                    if (mimeType === 'text/csv' || mimeType === 'application/csv') {
                        const datasetTags = await this.analyzeCSVDataset(fileBuffer);
                        tags = [...tags, ...datasetTags];
                    }
                    break;
                default:
                    // No special processing for other types
                    break;
            }
        }
        catch (error) {
            console.error(`Error extracting tags: ${error}`);
            // If extraction fails, just use the base tags
        }
        // Remove duplicates and return
        return [...new Set(tags)];
    }
    /**
     * Get random elements from an array
     * @param array Source array
     * @param count Number of elements to select
     * @returns Array of randomly selected elements
     */
    getRandomElements(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }
    /**
     * Determine the general category of a file based on MIME type
     * @param mimeType The MIME type
     * @returns The general category
     */
    getMimeCategory(mimeType) {
        if (!mimeType)
            return 'other';
        const lowerMime = mimeType.toLowerCase();
        if (lowerMime.startsWith('image/'))
            return 'image';
        if (lowerMime.startsWith('text/'))
            return 'text';
        if (lowerMime.startsWith('audio/'))
            return 'audio';
        if (lowerMime.startsWith('video/'))
            return 'video';
        // Document types
        if (lowerMime === 'application/pdf' ||
            lowerMime.includes('document') ||
            lowerMime.includes('msword') ||
            lowerMime.includes('officedocument') ||
            lowerMime.includes('oasis.opendocument')) {
            return 'document';
        }
        // Dataset types
        if (lowerMime === 'application/json' ||
            lowerMime === 'text/csv' ||
            lowerMime === 'application/csv' ||
            lowerMime === 'application/xml' ||
            lowerMime === 'text/xml' ||
            lowerMime.includes('spreadsheet')) {
            return 'dataset';
        }
        return 'other';
    }
    /**
     * Extract key terms from text content using OpenAI if available
     * @param text Text to analyze
     * @returns Array of extracted tags
     */
    async extractTextTags(text) {
        // Try OpenAI extraction first if API key is available
        if (env_config_1.AI_CONFIG.openaiApiKey) {
            try {
                return await this.extractTagsWithOpenAI(text);
            }
            catch (error) {
                console.error('OpenAI text extraction failed, falling back to basic extraction:', error);
            }
        }
        // Fallback to basic keyword extraction
        const culturalTerms = [
            'historical', 'artifact', 'heritage', 'culture', 'archive',
            'museum', 'collection', 'preservation', 'archaeology', 'anthropology',
            'ethnography', 'monument', 'manuscript', 'excavation', 'exhibition'
        ];
        const tags = [];
        // Simple check for term presence
        culturalTerms.forEach(term => {
            if (text.toLowerCase().includes(term)) {
                tags.push(term);
            }
        });
        // Add a general tag for text length
        if (text.length < 1000) {
            tags.push('short_text');
        }
        else if (text.length > 10000) {
            tags.push('long_text');
        }
        return tags.slice(0, 5); // Limit to 5 tags
    }
    /**
     * Extract tags using OpenAI API
     * @param text Text to analyze
     * @returns Array of extracted tags
     */
    async extractTagsWithOpenAI(text) {
        const prompt = `Analyze the following text and extract relevant tags for cultural heritage categorization. Focus on identifying:
- Historical periods or eras
- Cultural themes
- Geographic locations
- Types of artifacts or documents
- Research domains

Return only a JSON array of 3-7 relevant tags, no explanations.

Text: ${text.substring(0, 2000)}`;
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in cultural heritage and digital humanities. Extract relevant tags from text content.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 150,
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${env_config_1.AI_CONFIG.openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        try {
            const content = response.data.choices[0].message.content;
            const tags = JSON.parse(content.trim());
            return Array.isArray(tags) ? tags.slice(0, 7) : [];
        }
        catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError);
            return [];
        }
    }
    /**
     * Classify image content using TensorFlow.js if available
     * @param imageBuffer Image data
     * @returns Array of image tags
     */
    async classifyImage(imageBuffer) {
        if (this.imageModel) {
            try {
                // Try TensorFlow classification
                return await this.classifyImageWithTensorFlow(imageBuffer);
            }
            catch (error) {
                console.error('TensorFlow image classification failed:', error);
            }
        }
        // Fallback to heuristic-based classification
        return this.classifyImageHeuristic(imageBuffer);
    }
    /**
     * Classify image using TensorFlow.js model
     * @param imageBuffer Image data
     * @returns Array of image tags
     */
    async classifyImageWithTensorFlow(imageBuffer) {
        // Decode image from buffer
        const tensor = tf.node.decodeImage(imageBuffer, 3);
        // Resize to model input size (typically 224x224 for MobileNet)
        const resized = tf.image.resizeBilinear(tensor, [224, 224]);
        // Normalize pixel values to [0, 1]
        const normalized = resized.div(255.0);
        // Add batch dimension
        const batched = normalized.expandDims(0);
        // Run inference
        const predictions = this.imageModel.predict(batched);
        const scores = await predictions.data();
        // Clean up tensors
        tensor.dispose();
        resized.dispose();
        normalized.dispose();
        batched.dispose();
        predictions.dispose();
        // Convert model predictions to cultural heritage tags
        return this.interpretImagePredictions(Array.from(scores));
    }
    /**
     * Interpret model predictions for cultural heritage context
     * @param predictions Model output scores
     * @returns Array of cultural heritage tags
     */
    interpretImagePredictions(predictions) {
        // This is a simplified mapping - in production you'd have a custom model
        // trained specifically for cultural heritage content
        const tags = [];
        // Map generic predictions to cultural heritage categories
        const maxIndex = predictions.indexOf(Math.max(...predictions));
        const maxScore = predictions[maxIndex];
        if (maxScore > 0.3) {
            // High confidence predictions
            const mappings = [
                'historical_object', 'cultural_artifact', 'artwork', 'document',
                'architectural_element', 'ceremonial_object', 'tool', 'textile',
                'sculpture', 'painting', 'manuscript', 'photograph'
            ];
            tags.push(mappings[maxIndex % mappings.length]);
        }
        // Add general cultural heritage tags based on confidence
        if (maxScore > 0.5) {
            tags.push('museum_quality');
        }
        if (maxScore > 0.7) {
            tags.push('significant_artifact');
        }
        return tags.length > 0 ? tags : ['cultural_item'];
    }
    /**
     * Heuristic-based image classification fallback
     * @param imageBuffer Image data
     * @returns Array of image tags
     */
    classifyImageHeuristic(imageBuffer) {
        // Analyze image properties without deep learning
        const possibleTags = [
            'artifact', 'document', 'photograph', 'artwork',
            'portrait', 'landscape', 'building', 'object',
            'historical_site', 'map', 'illustration'
        ];
        // Basic file size heuristics
        const tags = [];
        const sizeKB = imageBuffer.length / 1024;
        if (sizeKB > 500) {
            tags.push('high_resolution');
        }
        if (sizeKB < 50) {
            tags.push('thumbnail');
        }
        // Add random cultural heritage tags for demonstration
        tags.push(...this.getRandomElements(possibleTags, 3));
        return tags;
    }
    /**
     * Analyze CSV dataset to extract metadata
     * @param csvBuffer CSV file content
     * @returns Tags describing the dataset
     */
    async analyzeCSVDataset(csvBuffer) {
        const tags = ['csv_dataset'];
        try {
            const csvData = csvBuffer.toString('utf-8');
            return await new Promise((resolve, reject) => {
                papaparse_1.default.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const headers = results.meta.fields || [];
                        const data = results.data;
                        const rowCount = data.length;
                        const columnTypes = new Map();
                        headers.forEach(header => columnTypes.set(header, new Set()));
                        data.forEach((row) => {
                            var _a;
                            for (const header of headers) {
                                const value = row[header];
                                const type = this.detectValueType(value);
                                (_a = columnTypes.get(header)) === null || _a === void 0 ? void 0 : _a.add(type);
                            }
                        });
                        // Add tags based on data structure
                        if (headers.length > 0) {
                            tags.push(`columns:${headers.length}`);
                        }
                        if (rowCount > 1000) {
                            tags.push('large_dataset');
                        }
                        // Check for common column patterns
                        if (headers.some(h => /date|time|year|month/i.test(h))) {
                            tags.push('temporal_data');
                        }
                        if (headers.some(h => /lat|lon|coord|location|geo/i.test(h))) {
                            tags.push('geospatial_data');
                        }
                        if (headers.some(h => /name|person|author|creator/i.test(h))) {
                            tags.push('person_data');
                        }
                        // Look for predominantly numeric dataset
                        const numericColumns = [...columnTypes.entries()]
                            .filter(([_, types]) => types.has('number'))
                            .length;
                        if (numericColumns > headers.length / 2) {
                            tags.push('quantitative_data');
                        }
                        resolve(tags);
                    },
                    error: (error) => {
                        console.error('Error parsing CSV with Papaparse:', error);
                        reject(error);
                    }
                });
            });
        }
        catch (error) {
            console.error('Error analyzing CSV:', error);
            return tags; // Return basic tags on error
        }
    }
    /**
     * Detect the data type of a value
     * @param value Value to check
     * @returns Type as a string
     */
    detectValueType(value) {
        if (value === undefined || value === null || value === '') {
            return 'null';
        }
        if (!isNaN(Number(value))) {
            return 'number';
        }
        // Check for date format
        if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(value)) {
            return 'date';
        }
        return 'string';
    }
    /**
     * Generate enhanced description using OpenAI
     * @param title Dataset title
     * @param description Original description
     * @param tags Extracted tags
     * @returns Enhanced description
     */
    async generateEnhancedDescription(title, description, tags) {
        if (!env_config_1.AI_CONFIG.openaiApiKey) {
            return description + '\n\nThis cultural heritage dataset contains valuable information that contributes to our understanding of historical and cultural contexts.';
        }
        try {
            const prompt = `Given this cultural heritage dataset information, write an enhanced description that provides academic and cultural context:

Title: ${title}
Original Description: ${description}
Tags: ${tags.join(', ')}

Create a 2-3 sentence enhanced description that:
- Explains the cultural/historical significance
- Identifies potential research applications
- Maintains academic tone
- Adds value beyond the original description

Return only the enhanced description, no additional formatting.`;
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a cultural heritage expert writing academic descriptions for research datasets.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 200,
                temperature: 0.4
            }, {
                headers: {
                    'Authorization': `Bearer ${env_config_1.AI_CONFIG.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const enhancedDescription = response.data.choices[0].message.content.trim();
            return description + '\n\n' + enhancedDescription;
        }
        catch (error) {
            console.error('Failed to generate enhanced description with OpenAI:', error);
            return description + '\n\nThis cultural heritage dataset provides valuable insights into historical and cultural contexts.';
        }
    }
    /**
     * Get potential cultural heritage categories for a dataset
     * @param tags Existing tags
     * @param metadata Dataset metadata
     * @returns Array of cultural heritage category suggestions
     */
    async suggestCulturalCategories(tags, metadata) {
        // Cultural heritage categories
        const categories = [
            'museum_collection',
            'archaeological_record',
            'historical_document',
            'oral_history',
            'cultural_artifact',
            'historical_photograph',
            'architectural_heritage',
            'ethnographic_record',
            'traditional_knowledge',
            'digital_preservation'
        ];
        // For MVP, select categories based on simple matching
        const suggestedCategories = [];
        // Check metadata and tags for keywords that might indicate categories
        const checkText = [
            ...((metadata === null || metadata === void 0 ? void 0 : metadata.title) ? [metadata.title] : []),
            ...((metadata === null || metadata === void 0 ? void 0 : metadata.description) ? [metadata.description] : []),
            ...tags
        ].join(' ').toLowerCase();
        // Match against common cultural heritage terms
        if (checkText.match(/museum|exhibition|gallery|collection/i)) {
            suggestedCategories.push('museum_collection');
        }
        if (checkText.match(/archaeolog|excavation|artifact|dig|ancient/i)) {
            suggestedCategories.push('archaeological_record');
        }
        if (checkText.match(/histor|archive|document|manuscript/i)) {
            suggestedCategories.push('historical_document');
        }
        if (checkText.match(/oral|interview|testimony|narrative|story/i)) {
            suggestedCategories.push('oral_history');
        }
        if (checkText.match(/artifact|object|item|relic/i)) {
            suggestedCategories.push('cultural_artifact');
        }
        if (checkText.match(/photo|image|picture/i)) {
            suggestedCategories.push('historical_photograph');
        }
        if (checkText.match(/architect|building|structure|monument/i)) {
            suggestedCategories.push('architectural_heritage');
        }
        if (checkText.match(/ethnograph|indigenous|traditional|community/i)) {
            suggestedCategories.push('ethnographic_record', 'traditional_knowledge');
        }
        if (checkText.match(/digital|preservation|conserv/i)) {
            suggestedCategories.push('digital_preservation');
        }
        // If no matches, return a few random suggestions
        if (suggestedCategories.length === 0) {
            return this.getRandomElements(categories, 3);
        }
        return [...new Set(suggestedCategories)];
    }
}
exports.AIService = AIService;
