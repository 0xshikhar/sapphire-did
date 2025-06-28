"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

import { type DataverseDataset } from "@/services/dataverse.service"
import { recommendationService, type RecommendationItem, type RecommendationType } from "@/services/recommendation.service"

interface DatasetRecommendationsProps {
  dataset: DataverseDataset
  additionalDatasets?: DataverseDataset[]
  maxRecommendations?: number
}

export function DatasetRecommendations({
  dataset,
  additionalDatasets = [],
  maxRecommendations = 3
}: DatasetRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get recommendations from service
        const items = await recommendationService.getRecommendationsForDataset(
          dataset,
          additionalDatasets,
          { maxResults: maxRecommendations }
        )

        setRecommendations(items)
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError("Failed to load recommendations")
      } finally {
        setIsLoading(false)
      }
    }

    if (dataset && additionalDatasets.length > 0) {
      fetchRecommendations()
    } else {
      setIsLoading(false)
      setError("Not enough data to generate recommendations")
    }
  }, [dataset, additionalDatasets, maxRecommendations])

  // Helper function to get badge variant based on recommendation type
  const getBadgeVariant = (type: RecommendationType) => {
    switch (type) {
      case 'similar':
        return "secondary" // purple
      case 'complementary':
        return "outline" // subtle
      case 'educational':
        return "default" // primary color
      case 'research':
        return "destructive" // red
      default:
        return "outline"
    }
  }

  // Helper function to get type label
  const getTypeLabel = (type: RecommendationType) => {
    switch (type) {
      case 'similar':
        return "Similar"
      case 'complementary':
        return "Complementary"
      case 'educational':
        return "Educational"
      case 'research':
        return "Research"
      default:
        return "Related"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Loading intelligent recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && recommendations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Intelligent content recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-center py-6 text-muted-foreground">
            <div>
              <Icons.info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Unable to generate recommendations at this time.</p>
              <p className="text-sm mt-1">Try again later or explore more datasets.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Intelligent content recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-center py-6 text-muted-foreground">
            <div>
              <Icons.search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recommendations found.</p>
              <p className="text-sm mt-1">Explore more datasets to improve recommendations.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>AI Recommendations</CardTitle>
        <CardDescription>Intelligent content recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((item) => (
            <div key={item.dataset.id} className="flex flex-col gap-2 border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{item.dataset.name || 'Untitled Dataset'}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.dataset.publisher || 'Unknown publisher'}
                    {item.dataset.published_at && (
                      <> · {formatDistanceToNow(new Date(item.dataset.published_at), { addSuffix: true })}</>
                    )}
                  </p>
                </div>
                <Badge variant={getBadgeVariant(item.type)}>{getTypeLabel(item.type)}</Badge>
              </div>
              <p className="text-sm">{item.matchReason}</p>
              <div className="flex gap-1 flex-wrap">
                {(item.dataset.subjects || []).slice(0, 3).map((subject, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {(item.dataset.subjects || []).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(item.dataset.subjects || []).length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex justify-end mt-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/dataverse/dataset/${encodeURIComponent(item.dataset.id?.toString() || '')}`}>
                    <Icons.arrowRight className="mr-2 h-3 w-3" />
                    View Dataset
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/dashboard/dataverse">
            <Icons.search className="mr-2 h-4 w-4" />
            Discover more related content
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
