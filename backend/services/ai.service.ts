import * as tf from '@tensorflow/tfjs-node'
import * as fs from 'fs'
import * as path from 'path'
import Papa, { ParseResult } from 'papaparse';

// Define mime type categories for classification
type MimeCategory = 'image' | 'text' | 'document' | 'audio' | 'video' | 'dataset' | 'other'

/**
 * Service for AI-powered metadata extraction and content classification
 */
export class AIService {
  private imageModel: any = null
  private textModel: any = null
  private categoryTags: Map<MimeCategory, string[]>

  constructor() {
    // Initialize category tags for different content types
    this.categoryTags = new Map<MimeCategory, string[]>([
      ['image', ['photography', 'artwork', 'diagram', 'chart', 'map', 'portrait', 'landscape', 'historical']],
      ['text', ['article', 'literature', 'research', 'documentation', 'transcription', 'manuscript']],
      ['document', ['report', 'publication', 'catalog', 'archive', 'legal', 'academic', 'historical']],
      ['audio', ['music', 'interview', 'lecture', 'ambient', 'historical', 'recording', 'oral_history']],
      ['video', ['documentary', 'interview', 'presentation', 'performance', 'historical_footage']],
      ['dataset', ['collection', 'survey', 'statistics', 'records', 'catalog_data', 'research_data']],
      ['other', ['mixed_content', 'unknown', 'other']]
    ])

    // Models will be lazily loaded when needed
    this.loadModels()
  }

  /**
   * Load TensorFlow models in the background
   */
  private async loadModels(): Promise<void> {
    try {
      // Load models in background to avoid blocking startup
      if (process.env.AI_MODELS_ENABLED === 'true') {
        // Note: In a production environment, these would be proper model paths
        // For MVP we use simple classification for demonstration
        console.log('Initializing AI models...')
        
        // For a real implementation, we would load actual models:
        // this.imageModel = await tf.loadLayersModel('file://./models/image-classifier/model.json')
        // this.textModel = await tf.loadLayersModel('file://./models/text-classifier/model.json')
        
        console.log('AI models initialized')
      } else {
        console.log('AI models disabled by configuration')
      }
    } catch (error) {
      console.error('Error loading AI models:', error)
      // Continue without models - we'll fall back to basic classification
    }
  }

  /**
   * Extract tags from a file based on its content and metadata
   * @param fileBuffer The file content as a buffer
   * @param mimeType The MIME type of the file
   * @returns Array of extracted tags
   */
  async extractTags(fileBuffer: Buffer, mimeType: string): Promise<string[]> {
    const category = this.getMimeCategory(mimeType)
    let tags: string[] = []

    // Add base category tag
    tags.push(category)
    
    // Add sample tags based on file category
    // In a real implementation, we would use AI models to generate these
    const categorySpecificTags = this.categoryTags.get(category) || []
    
    // For MVP, randomly select a few tags from the category
    const numTags = Math.floor(Math.random() * 3) + 1 // 1-3 tags
    const selectedTags = this.getRandomElements(categorySpecificTags, numTags)
    tags = [...tags, ...selectedTags]

    // Try to extract more content-specific tags based on the mime type
    try {
      switch (category) {
        case 'image':
          if (this.imageModel) {
            const imageTags = await this.classifyImage(fileBuffer)
            tags = [...tags, ...imageTags]
          }
          break
          
        case 'text':
        case 'document':
          const textContent = fileBuffer.toString('utf-8', 0, Math.min(10000, fileBuffer.length))
          const textTags = await this.extractTextTags(textContent)
          tags = [...tags, ...textTags]
          break
          
        case 'dataset':
          if (mimeType === 'text/csv' || mimeType === 'application/csv') {
            const datasetTags = await this.analyzeCSVDataset(fileBuffer)
            tags = [...tags, ...datasetTags]
          }
          break
          
        default:
          // No special processing for other types
          break
      }
    } catch (error) {
      console.error(`Error extracting tags: ${error}`)
      // If extraction fails, just use the base tags
    }
    
    // Remove duplicates and return
    return [...new Set(tags)]
  }

  /**
   * Get random elements from an array
   * @param array Source array
   * @param count Number of elements to select
   * @returns Array of randomly selected elements
   */
  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, array.length))
  }

  /**
   * Determine the general category of a file based on MIME type
   * @param mimeType The MIME type
   * @returns The general category
   */
  private getMimeCategory(mimeType: string): MimeCategory {
    if (!mimeType) return 'other'
    
    const lowerMime = mimeType.toLowerCase()
    
    if (lowerMime.startsWith('image/')) return 'image'
    if (lowerMime.startsWith('text/')) return 'text'
    if (lowerMime.startsWith('audio/')) return 'audio'
    if (lowerMime.startsWith('video/')) return 'video'
    
    // Document types
    if (
      lowerMime === 'application/pdf' ||
      lowerMime.includes('document') ||
      lowerMime.includes('msword') ||
      lowerMime.includes('officedocument') ||
      lowerMime.includes('oasis.opendocument')
    ) {
      return 'document'
    }
    
    // Dataset types
    if (
      lowerMime === 'application/json' ||
      lowerMime === 'text/csv' ||
      lowerMime === 'application/csv' ||
      lowerMime === 'application/xml' ||
      lowerMime === 'text/xml' ||
      lowerMime.includes('spreadsheet')
    ) {
      return 'dataset'
    }
    
    return 'other'
  }

  /**
   * Extract key terms from text content
   * @param text Text to analyze
   * @returns Array of extracted tags
   */
  private async extractTextTags(text: string): Promise<string[]> {
    // In a production system, this would use NLP/TensorFlow
    // For MVP, we'll use a simple keyword extraction approach
    
    // Common cultural heritage terms to look for
    const culturalTerms = [
      'historical', 'artifact', 'heritage', 'culture', 'archive', 
      'museum', 'collection', 'preservation', 'archaeology', 'anthropology',
      'ethnography', 'monument', 'manuscript', 'excavation', 'exhibition'
    ]
    
    const tags: string[] = []
    
    // Simple check for term presence
    culturalTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        tags.push(term)
      }
    })
    
    // Add a general tag for text length
    if (text.length < 1000) {
      tags.push('short_text')
    } else if (text.length > 10000) {
      tags.push('long_text')
    }
    
    return tags.slice(0, 5) // Limit to 5 tags
  }

  /**
   * Classify image content
   * @param imageBuffer Image data
   * @returns Array of image tags
   */
  private async classifyImage(imageBuffer: Buffer): Promise<string[]> {
    // For MVP, return placeholder tags
    // In production, this would use the TensorFlow model
    
    // This is where we would process the image with TensorFlow:
    // 1. Decode the image
    // 2. Preprocess it for the model
    // 3. Run inference
    // 4. Process the results
    
    // For now, return random cultural heritage image tags
    const possibleTags = [
      'artifact', 'document', 'photograph', 'artwork',
      'portrait', 'landscape', 'building', 'object',
      'historical_site', 'map', 'illustration'
    ]
    
    return this.getRandomElements(possibleTags, 3)
  }

  /**
   * Analyze CSV dataset to extract metadata
   * @param csvBuffer CSV file content
   * @returns Tags describing the dataset
   */
  private async analyzeCSVDataset(csvBuffer: Buffer): Promise<string[]> {
    const tags: string[] = ['csv_dataset'];
    
    try {
      const csvData = csvBuffer.toString('utf-8');
      
      return await new Promise<string[]>((resolve, reject) => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results: ParseResult<Record<string, string>>) => {
            const headers: string[] = results.meta.fields || [];
            const data: Record<string, string>[] = results.data as Record<string, string>[];
            const rowCount = data.length;
            const columnTypes: Map<string, Set<string>> = new Map();

            headers.forEach(header => columnTypes.set(header, new Set()));

            data.forEach((row: Record<string, string>) => {
              for (const header of headers) {
                const value = row[header];
                const type = this.detectValueType(value);
                columnTypes.get(header)?.add(type);
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
          error: (error: any) => {
            console.error('Error parsing CSV with Papaparse:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error analyzing CSV:', error);
      return tags; // Return basic tags on error
    }
  }

  /**
   * Detect the data type of a value
   * @param value Value to check
   * @returns Type as a string
   */
  private detectValueType(value: any): string {
    if (value === undefined || value === null || value === '') {
      return 'null'
    }
    
    if (!isNaN(Number(value))) {
      return 'number'
    }
    
    // Check for date format
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(value)) {
      return 'date'
    }
    
    return 'string'
  }
  
  /**
   * Get potential cultural heritage categories for a dataset
   * @param tags Existing tags
   * @param metadata Dataset metadata
   * @returns Array of cultural heritage category suggestions
   */
  async suggestCulturalCategories(tags: string[], metadata: any): Promise<string[]> {
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
    ]
    
    // For MVP, select categories based on simple matching
    const suggestedCategories: string[] = []
    
    // Check metadata and tags for keywords that might indicate categories
    const checkText = [
      ...(metadata?.title ? [metadata.title] : []),
      ...(metadata?.description ? [metadata.description] : []),
      ...tags
    ].join(' ').toLowerCase()
    
    // Match against common cultural heritage terms
    if (checkText.match(/museum|exhibition|gallery|collection/i)) {
      suggestedCategories.push('museum_collection')
    }
    
    if (checkText.match(/archaeolog|excavation|artifact|dig|ancient/i)) {
      suggestedCategories.push('archaeological_record')
    }
    
    if (checkText.match(/histor|archive|document|manuscript/i)) {
      suggestedCategories.push('historical_document')
    }
    
    if (checkText.match(/oral|interview|testimony|narrative|story/i)) {
      suggestedCategories.push('oral_history')
    }
    
    if (checkText.match(/artifact|object|item|relic/i)) {
      suggestedCategories.push('cultural_artifact')
    }
    
    if (checkText.match(/photo|image|picture/i)) {
      suggestedCategories.push('historical_photograph')
    }
    
    if (checkText.match(/architect|building|structure|monument/i)) {
      suggestedCategories.push('architectural_heritage')
    }
    
    if (checkText.match(/ethnograph|indigenous|traditional|community/i)) {
      suggestedCategories.push('ethnographic_record', 'traditional_knowledge')
    }
    
    if (checkText.match(/digital|preservation|conserv/i)) {
      suggestedCategories.push('digital_preservation')
    }
    
    // If no matches, return a few random suggestions
    if (suggestedCategories.length === 0) {
      return this.getRandomElements(categories, 3)
    }
    
    return [...new Set(suggestedCategories)]
  }
}
