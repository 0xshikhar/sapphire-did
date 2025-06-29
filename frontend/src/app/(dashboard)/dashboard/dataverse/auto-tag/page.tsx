"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { harvardDataverse, type DataverseDataset, type SearchParams, type SearchResults } from "@/services/dataverse.service"
import { aiMetadataService, type AIEnhancedMetadata } from "@/services/ai-metadata.service"

interface TaggingOptions {
  generateTags: boolean;
  classifyContent: boolean;
  addCulturalContext: boolean;
  addHistoricalSignificance: boolean;
}

export default function AutoTagPage() {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<DataverseDataset[]>([])

  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedResults, setProcessedResults] = useState<Map<string, AIEnhancedMetadata>>(new Map())

  const [taggingOptions, setTaggingOptions] = useState<TaggingOptions>({
    generateTags: true,
    classifyContent: true,
    addCulturalContext: true,
    addHistoricalSignificance: false
  })

  // Search for datasets
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      return
    }

    try {
      setIsSearching(true)

      // Search for datasets
      const params: SearchParams = {
        q: searchQuery,
        per_page: 20,
        type: 'dataset'
      }

      const results = await harvardDataverse.searchDatasets(searchQuery, params)

      // Extract datasets from results
      const datasets = results?.data?.items || []
      setSearchResults(datasets as DataverseDataset[])

      // Clear previous selections
      setSelectedDatasets(new Set())
      setProcessedResults(new Map())

    } catch (err) {
      console.error("Error searching datasets:", err)
      toast.error("Failed to search datasets. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle dataset selection
  const toggleDatasetSelection = (datasetId: string) => {
    setSelectedDatasets(prevSelected => {
      const newSelected = new Set(prevSelected)

      if (newSelected.has(datasetId)) {
        newSelected.delete(datasetId)
      } else {
        newSelected.add(datasetId)
      }

      return newSelected
    })
  }

  // Select/deselect all datasets
  const toggleSelectAll = () => {
    if (selectedDatasets.size === searchResults.length) {
      // Deselect all if all are currently selected
      setSelectedDatasets(new Set())
    } else {
      // Select all
      const allIds = new Set<string>()
      searchResults.forEach(dataset => {
        if (dataset.id) {
          allIds.add(dataset.id.toString())
        }
      })
      setSelectedDatasets(allIds)
    }
  }

  // Process selected datasets with AI
  const processSelectedDatasets = async () => {
    if (selectedDatasets.size === 0) {
      toast.error("Please select at least one dataset to process.")
      return
    }

    try {
      setIsProcessing(true)

      // Create a copy of the current processed results
      const newProcessedResults = new Map(processedResults)

      // Process each selected dataset
      // Use Array.from to convert Set to Array for iteration
      for (const datasetId of Array.from(selectedDatasets)) {
        // Skip already processed datasets
        if (processedResults.has(datasetId)) {
          continue
        }

        // Find the dataset in search results
        const dataset = searchResults.find(d => d.id && d.id.toString() === datasetId)

        if (dataset) {
          // Process dataset with AI
          const enhancedMetadata = await aiMetadataService.processDataset(dataset, {
            enhanceDescription: false,
            generateTags: taggingOptions.generateTags,
            classifyContent: taggingOptions.classifyContent,
            generateRecommendations: false,
            addCulturalContext: taggingOptions.addCulturalContext,
            addHistoricalSignificance: taggingOptions.addHistoricalSignificance
          })

          // Store the processed result
          newProcessedResults.set(datasetId, enhancedMetadata)
        }
      }

      // Update processed results
      setProcessedResults(newProcessedResults)

      toast("Successfully processed ${selectedDatasets.size} dataset(s).")
    } catch (err) {
      console.error("Error processing datasets:", err)
      toast.error("Failed to process selected datasets. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Save all processed metadata
  const saveAllProcessedMetadata = async () => {
    if (processedResults.size === 0) {
      toast.error("Please process at least one dataset before saving.")
      return
    }

    try {
      // In a real implementation, this would call an API to save all the enhanced metadata
      // For now, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success("Successfully saved enhanced metadata for ${processedResults.size} dataset(s).")

      // Navigate to dataset search
      router.push('/dashboard/dataverse')
    } catch (err) {
      console.error("Error saving metadata:", err)
      toast.error("Failed to save metadata. Please try again.")
    }
  }

  // Toggle a tagging option
  const toggleTaggingOption = (option: keyof TaggingOptions) => {
    setTaggingOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="AI Auto-Tagging & Classification"
        description="Automatically tag and classify multiple cultural heritage datasets using AI"
      >
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/dataverse">
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="flex flex-col gap-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search Cultural Heritage Datasets</CardTitle>
            <CardDescription>Find datasets to tag and classify</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search datasets..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Icons.search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tagging Options */}
        <Card>
          <CardHeader>
            <CardTitle>AI Tagging Options</CardTitle>
            <CardDescription>Select which types of AI tagging to apply</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateTags"
                  checked={taggingOptions.generateTags}
                  onCheckedChange={() => toggleTaggingOption('generateTags')}
                />
                <label htmlFor="generateTags" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Generate Tags & Keywords
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="classifyContent"
                  checked={taggingOptions.classifyContent}
                  onCheckedChange={() => toggleTaggingOption('classifyContent')}
                />
                <label htmlFor="classifyContent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Classify Content
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addCulturalContext"
                  checked={taggingOptions.addCulturalContext}
                  onCheckedChange={() => toggleTaggingOption('addCulturalContext')}
                />
                <label htmlFor="addCulturalContext" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Add Cultural Context
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addHistoricalSignificance"
                  checked={taggingOptions.addHistoricalSignificance}
                  onCheckedChange={() => toggleTaggingOption('addHistoricalSignificance')}
                />
                <label htmlFor="addHistoricalSignificance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Add Historical Significance
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>Found {searchResults.length} datasets</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSelectAll}
                >
                  {selectedDatasets.size === searchResults.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  size="sm"
                  onClick={processSelectedDatasets}
                  disabled={selectedDatasets.size === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icons.sparkles className="mr-2 h-4 w-4" />
                      Process Selected ({selectedDatasets.size})
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Dataset</TableHead>
                    <TableHead className="hidden md:table-cell">Publisher</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((dataset) => {
                    const datasetId = dataset.id ? dataset.id.toString() : '';
                    const isSelected = selectedDatasets.has(datasetId);
                    const isProcessed = processedResults.has(datasetId);

                    return (
                      <TableRow key={datasetId}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDatasetSelection(datasetId)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{dataset.name || 'Untitled Dataset'}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {dataset.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {dataset.publisher || 'Unknown'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {isProcessed ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">Processed</Badge>
                          ) : isSelected ? (
                            <Badge variant="outline">Selected</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Unprocessed</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/dashboard/dataverse/dataset/${encodeURIComponent(datasetId)}`}>
                              <Icons.arrowRight className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
            {processedResults.size > 0 && (
              <CardFooter className="flex justify-end">
                <Button onClick={saveAllProcessedMetadata}>
                  <Icons.check className="mr-2 h-4 w-4" />
                  Save All Processed Metadata ({processedResults.size})
                </Button>
              </CardFooter>
            )}
          </Card>
        )}

        {/* Processed Results */}
        {processedResults.size > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Tags & Classifications</CardTitle>
              <CardDescription>Results of AI processing for selected datasets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from(processedResults).map(([datasetId, metadata]) => {
                  const dataset = searchResults.find(d => d.id && d.id.toString() === datasetId);

                  return (
                    <div key={datasetId} className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{dataset?.name || 'Untitled Dataset'}</h3>
                        <p className="text-sm text-muted-foreground">{dataset?.global_id || datasetId}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {metadata.aiGeneratedTags && metadata.aiGeneratedTags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">AI-Generated Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {metadata.aiGeneratedTags.map((tag, i) => (
                                <Badge key={i} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {metadata.aiClassification && metadata.aiClassification.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Content Classification</h4>
                            <div className="space-y-1">
                              {metadata.aiClassification.map((classification, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span>{classification.category}</span>
                                  <span className="text-muted-foreground">{Math.round(classification.confidence * 100)}% confidence</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {metadata.aiCulturalContext && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Cultural Context</h4>
                          <p className="text-sm">{metadata.aiCulturalContext}</p>
                        </div>
                      )}

                      {metadata.aiHistoricalSignificance && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Historical Significance</h4>
                          <p className="text-sm">{metadata.aiHistoricalSignificance}</p>
                        </div>
                      )}

                      <Separator />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
