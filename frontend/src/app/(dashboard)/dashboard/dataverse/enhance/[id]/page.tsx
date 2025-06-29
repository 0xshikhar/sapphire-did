"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { harvardDataverse, type DataverseDataset } from "@/services/dataverse.service"
import { aiMetadataService, type AIEnhancedMetadata, type MetadataEnhancementOptions } from "@/services/ai-metadata.service"

export default function EnhanceDatasetPage() {
  const params = useParams()
  const router = useRouter()
  const datasetId = decodeURIComponent(params.id as string)

  const [dataset, setDataset] = useState<DataverseDataset | null>(null)
  const [enhancedMetadata, setEnhancedMetadata] = useState<AIEnhancedMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [options, setOptions] = useState<MetadataEnhancementOptions>({
    enhanceDescription: true,
    generateTags: true,
    classifyContent: true,
    generateRecommendations: true,
    addCulturalContext: true,
    addHistoricalSignificance: false
  })

  // Fetch dataset details
  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch dataset details
        const datasetDetails = await harvardDataverse.getDataset(datasetId)

        // Make sure we got a valid response
        if (datasetDetails) {
          setDataset(datasetDetails)
        } else {
          throw new Error("Dataset not found")
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load dataset. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchDataset()
  }, [datasetId])

  // Handle AI processing
  const handleEnhanceMetadata = async () => {
    if (!dataset) return

    try {
      setIsProcessing(true)

      // Process dataset with AI
      const enhanced = await aiMetadataService.processDataset(dataset as any, options)
      setEnhancedMetadata(enhanced)

      toast.success("Metadata enhanced successfully")
    } catch (err) {
      console.error("Error enhancing metadata:", err)
      toast.error("There was an error enhancing the metadata. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle option change
  const toggleOption = (option: keyof MetadataEnhancementOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  // Handle saving enhanced metadata
  const handleSaveEnhancement = async () => {
    if (!enhancedMetadata) return

    try {
      // In a real implementation, this would call an API to save the enhanced metadata
      // For now, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success("Enhanced metadata saved")

      // Navigate back to dataset details
      router.push(`/dashboard/dataverse/dataset/${encodeURIComponent(datasetId)}`)
    } catch (err) {
      console.error("Error saving enhanced metadata:", err)
      toast.error("There was an error saving the enhanced metadata. Please try again.")
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={isLoading ? "Loading Dataset..." : `AI Enhance: ${dataset?.name || "Dataset"}`}
        description="Use AI to enhance and enrich cultural heritage metadata"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button asChild>
            <Link href={`/dashboard/dataverse/dataset/${encodeURIComponent(datasetId)}`}>
              <Icons.externalLink className="mr-2 h-4 w-4" />
              View Dataset
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="flex flex-col gap-6">
        {error && (
          <Alert variant="destructive">
            <Icons.alertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          // Loading skeleton
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28 mr-2" />
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        ) : dataset ? (
          <>
            {/* Dataset Info */}
            <Card>
              <CardHeader>
                <CardTitle>Dataset Information</CardTitle>
                <CardDescription>Basic details about this cultural heritage dataset</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                    <p className="text-base">{dataset.name || "Untitled"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Publisher</h3>
                    <p className="text-base">{(dataset as any).publisher || "Unknown"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="text-base">{(dataset as any).description || "No description available"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Enhancement Options */}
            <Card>
              <CardHeader>
                <CardTitle>AI Enhancement Options</CardTitle>
                <CardDescription>Select which types of AI enhancements to apply</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enhanceDescription"
                      checked={options.enhanceDescription}
                      onCheckedChange={() => toggleOption('enhanceDescription')}
                    />
                    <label htmlFor="enhanceDescription" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Enhance Description
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateTags"
                      checked={options.generateTags}
                      onCheckedChange={() => toggleOption('generateTags')}
                    />
                    <label htmlFor="generateTags" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Generate Tags & Keywords
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="classifyContent"
                      checked={options.classifyContent}
                      onCheckedChange={() => toggleOption('classifyContent')}
                    />
                    <label htmlFor="classifyContent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Classify Content
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateRecommendations"
                      checked={options.generateRecommendations}
                      onCheckedChange={() => toggleOption('generateRecommendations')}
                    />
                    <label htmlFor="generateRecommendations" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Generate Recommendations
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="addCulturalContext"
                      checked={options.addCulturalContext}
                      onCheckedChange={() => toggleOption('addCulturalContext')}
                    />
                    <label htmlFor="addCulturalContext" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Add Cultural Context
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="addHistoricalSignificance"
                      checked={options.addHistoricalSignificance}
                      onCheckedChange={() => toggleOption('addHistoricalSignificance')}
                    />
                    <label htmlFor="addHistoricalSignificance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Add Historical Significance
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleEnhanceMetadata}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Icons.sparkles className="mr-2 h-4 w-4" />
                      Enhance Metadata with AI
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* AI Enhanced Results */}
            {enhancedMetadata && (
              <Card>
                <CardHeader>
                  <CardTitle>AI-Enhanced Metadata</CardTitle>
                  <CardDescription>Cultural heritage metadata enriched with AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="description">
                    <TabsList className="grid grid-cols-3 md:grid-cols-6">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="tags">Tags</TabsTrigger>
                      <TabsTrigger value="classification">Classification</TabsTrigger>
                      <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                      <TabsTrigger value="cultural">Cultural Context</TabsTrigger>
                      <TabsTrigger value="historical">Historical</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-4 space-y-4">
                      <h3 className="font-medium">Enhanced Description</h3>
                      <p className="text-sm">{enhancedMetadata.aiEnhancedDescription || "No enhanced description generated."}</p>
                    </TabsContent>

                    <TabsContent value="tags" className="mt-4 space-y-4">
                      <h3 className="font-medium">AI-Generated Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {enhancedMetadata.aiGeneratedTags?.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                        {(!enhancedMetadata.aiGeneratedTags || enhancedMetadata.aiGeneratedTags.length === 0) && (
                          <p className="text-sm text-muted-foreground">No tags generated.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="classification" className="mt-4 space-y-4">
                      <h3 className="font-medium">Content Classification</h3>
                      <div className="space-y-2">
                        {enhancedMetadata.aiClassification?.map((classification, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{classification.category}</span>
                            <Badge variant="outline">{Math.round(classification.confidence * 100)}% Confidence</Badge>
                          </div>
                        ))}
                        {(!enhancedMetadata.aiClassification || enhancedMetadata.aiClassification.length === 0) && (
                          <p className="text-sm text-muted-foreground">No classification generated.</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="recommendations" className="mt-4 space-y-4">
                      <h3 className="font-medium">AI Recommendations</h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Related Datasets</h4>
                          <ul className="list-disc list-inside text-sm mt-2">
                            {enhancedMetadata.aiRecommendations?.relatedDatasets?.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                          {(!enhancedMetadata.aiRecommendations?.relatedDatasets ||
                            enhancedMetadata.aiRecommendations.relatedDatasets.length === 0) && (
                              <p className="text-sm text-muted-foreground mt-2">No related datasets found.</p>
                            )}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Research Applications</h4>
                          <ul className="list-disc list-inside text-sm mt-2">
                            {enhancedMetadata.aiRecommendations?.researchApplications?.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                          {(!enhancedMetadata.aiRecommendations?.researchApplications ||
                            enhancedMetadata.aiRecommendations.researchApplications.length === 0) && (
                              <p className="text-sm text-muted-foreground mt-2">No research applications suggested.</p>
                            )}
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Educational Uses</h4>
                          <ul className="list-disc list-inside text-sm mt-2">
                            {enhancedMetadata.aiRecommendations?.educationalUses?.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                          {(!enhancedMetadata.aiRecommendations?.educationalUses ||
                            enhancedMetadata.aiRecommendations.educationalUses.length === 0) && (
                              <p className="text-sm text-muted-foreground mt-2">No educational uses suggested.</p>
                            )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="cultural" className="mt-4 space-y-4">
                      <h3 className="font-medium">Cultural Context</h3>
                      <p className="text-sm">{enhancedMetadata.aiCulturalContext || "No cultural context information generated."}</p>
                    </TabsContent>

                    <TabsContent value="historical" className="mt-4 space-y-4">
                      <h3 className="font-medium">Historical Significance</h3>
                      <p className="text-sm">{enhancedMetadata.aiHistoricalSignificance || "No historical significance information generated."}</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveEnhancement}>
                    <Icons.check className="mr-2 h-4 w-4" />
                    Save Enhanced Metadata
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Dataset Not Found</CardTitle>
              <CardDescription>
                The requested dataset could not be found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The dataset with identifier <code>{datasetId}</code> could not be found in Harvard Dataverse.
                It may have been removed or the identifier is incorrect.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push('/dashboard/dataverse')}>
                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
