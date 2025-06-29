"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { harvardDataverse, type SearchParams } from "@/services/dataverse.service"
import { recommendationService } from "@/services/recommendation.service"

interface DatasetSearchResult {
  name: string
  id: string
  global_id: string
  description: string
  published_at: string
  publisher: string
  citation: string
  subjects?: string[]
  fileCount?: number
}

interface SearchState {
  query: string
  results: DatasetSearchResult[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalResults: number
}

import { Suspense } from "react"

function DataverseSearch() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchState, setSearchState] = useState<SearchState>({
    query: initialQuery,
    results: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
  })

  const [aiSearchState, setAiSearchState] = useState<SearchState>({
    query: initialQuery,
    results: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
  })

  const [inputQuery, setInputQuery] = useState(initialQuery)

  const handleSearch = useCallback(async (page = 1, query: string) => {
    if (!query) return

    setSearchState((prev) => ({ ...prev, isLoading: true, error: null, query }))
    setAiSearchState((prev) => ({ ...prev, isLoading: true, error: null, query }))

    try {
      const searchOptions: SearchParams = {
        q: query,
        type: "dataset",
        per_page: 10,
        start: (page - 1) * 10,
      }
      
      const aiSearchOptions = { text: query }

      const [standardResponse, aiResponse] = await Promise.all([
        harvardDataverse.searchDatasets(query, searchOptions),
        recommendationService.enhancedSearch(aiSearchOptions),
      ])

      // Process standard results
      const totalResults = standardResponse.data.total_count
      const totalPages = Math.ceil(totalResults / 10)
      const formattedStandardResults = standardResponse.data.items.map((item: any) => ({
        name: item.name,
        id: item.global_id.replace("doi:", ""),
        global_id: item.global_id,
        description: item.description || "No description available",
        published_at: new Date(item.published_at).toLocaleDateString(),
        publisher: item.publisher || "Unknown publisher",
        citation: item.citation || "",
        subjects: item.subjects || [],
        fileCount: item.fileCount,
      }))
      setSearchState((prev) => ({
        ...prev,
        results: formattedStandardResults,
        isLoading: false,
        currentPage: page,
        totalPages,
        totalResults,
      }))

      // Process AI results
      const formattedAiResults = (aiResponse || []).map((item: any) => ({
        name: item.name,
        id: item.global_id.replace("doi:", ""),
        global_id: item.global_id,
        description: item.description || "No description available",
        published_at: new Date(item.published_at).toLocaleDateString(),
        publisher: item.publisher || "Unknown publisher",
        citation: item.citation || "",
        subjects: item.subjects || [],
        fileCount: item.fileCount,
      }))
      setAiSearchState((prev) => ({
        ...prev,
        results: formattedAiResults,
        isLoading: false,
        totalResults: formattedAiResults.length,
        totalPages: 1, // AI search is not paginated from backend
        currentPage: 1,
      }))
    } catch (error) {
      console.error("Error during search:", error)
      const errorMessage = "Failed to fetch search results. Please try again later."
      setSearchState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      setAiSearchState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(1, inputQuery)
  }

  const handlePageChange = (page: number) => {
    handleSearch(page, searchState.query)
  }

  const renderResults = (searchState: SearchState) => {
    if (searchState.isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )
    }

    if (searchState.error) {
      return (
        <Alert variant="destructive">
          <Icons.alertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{searchState.error}</AlertDescription>
        </Alert>
      )
    }

    if (searchState.results.length === 0 && searchState.query) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No results found</CardTitle>
            <CardDescription>
              {`No datasets match your search for "${searchState.query}"`}
            </CardDescription>
          </CardHeader>
        </Card>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {searchState.results.map((dataset) => (
          <Card key={dataset.id}>
            <CardHeader>
              <CardTitle>{dataset.name}</CardTitle>
              <CardDescription>
                Published: {dataset.published_at} • Publisher: {dataset.publisher}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {dataset.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {dataset.subjects?.slice(0, 5).map((subject, i) => (
                  <Badge key={i} variant="secondary">
                    {subject}
                  </Badge>
                ))}
                {dataset.subjects && dataset.subjects.length > 5 && (
                  <Badge variant="outline">+{dataset.subjects.length - 5} more</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">DOI: {dataset.id}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/dataverse/dataset/${encodeURIComponent(dataset.global_id)}`}>
                    <Icons.info className="mr-2 h-4 w-4" />
                    Details
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/dataverse/link/${encodeURIComponent(dataset.global_id)}`}>
                    <Icons.link className="mr-2 h-4 w-4" />
                    Link to DID
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Initial search if query is provided in URL
  useEffect(() => {
    if (initialQuery) {
      handleSearch(1, initialQuery)
    }
  }, [initialQuery, handleSearch])

  return (
      <DashboardShell>
      <DashboardHeader
        heading="Harvard Dataverse"
        description="Search and explore cultural heritage datasets from Harvard Dataverse"
      >
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="https://dataverse.harvard.edu/" target="_blank" rel="noopener noreferrer">
              <Icons.externalLink className="mr-2 h-4 w-4" />
              Visit Harvard Dataverse
            </Link>
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search by keyword, e.g., 'ancient manuscripts'"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={searchState.isLoading || aiSearchState.isLoading}>
              {(searchState.isLoading || aiSearchState.isLoading) ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </form>

        <Tabs defaultValue="standard" className="grid gap-6">
          <TabsList>
            <TabsTrigger value="standard">Standard Results ({searchState.totalResults})</TabsTrigger>
            <TabsTrigger value="ai">AI-Powered Results ({aiSearchState.totalResults})</TabsTrigger>
          </TabsList>
          <TabsContent value="standard">
            <div className="flex flex-col gap-4">
              {renderResults(searchState)}
              {searchState.results.length > 0 && searchState.totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(searchState.currentPage - 1); }}
                        aria-disabled={searchState.currentPage <= 1}
                        className={searchState.currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[...Array(searchState.totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                          isActive={searchState.currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(searchState.currentPage + 1); }}
                        aria-disabled={searchState.currentPage >= searchState.totalPages}
                        className={searchState.currentPage >= searchState.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </TabsContent>
          <TabsContent value="ai">{renderResults(aiSearchState)}</TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}

export default function DataversePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Dataverse search...</div>}>
      <DataverseSearch />
    </Suspense>
  )
}
