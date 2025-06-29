"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { usePrivy } from "@privy-io/react-auth"
import Link from "next/link"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"

import { DatasetList } from "@/components/datasets/dataset-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMyDatasets, unlinkDataset, Dataset } from "@/services/dataset.service"
import { toast } from "sonner"

export default function DataVaultPage() {
  const { getAccessToken } = usePrivy()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("date-desc")
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDatasets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await getAccessToken()
      if (!token) {
        setError("Authentication failed. Please log in again.")
        return
      }
      const fetchedDatasets = await getMyDatasets(token)
      setDatasets(fetchedDatasets)
    } catch (err: any) {
      console.error("Failed to fetch datasets:", err)
      setError(err.message || "Could not load your datasets. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    fetchDatasets()
  }, [fetchDatasets])

  const filteredAndSortedDatasets = useMemo(() => {
    return datasets
      .filter((dataset) =>
        dataset.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        switch (sort) {
          case "date-asc":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          case "name-asc":
            return a.title.localeCompare(b.title)
          case "name-desc":
            return b.title.localeCompare(a.title)
          case "date-desc":
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
  }, [datasets, search, sort])

  const handleUnlink = async (datasetId: string) => {
    const datasetToUnlink = datasets.find((d) => d.id === datasetId)
    if (!datasetToUnlink) return

    const originalDatasets = [...datasets]
    setDatasets((prev) => prev.filter((d) => d.id !== datasetId))

    try {
      const token = await getAccessToken()
      if (!token) {
        toast.error("Authentication failed. Please log in again.")
        setDatasets(originalDatasets)
        return
      }
      await unlinkDataset(datasetToUnlink.did, token)
      toast.success("Dataset has been successfully unlinked from its DID.")
    } catch (error: any) {
      console.error("Failed to unlink dataset:", error)
      toast.error(error.message || "Failed to unlink the dataset. Please try again.")
      setDatasets(originalDatasets)
    }
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Data Vault"
        description="Manage your cultural heritage datasets securely with GDPR compliance"
      >
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/upload">
              <Icons.upload className="mr-2 h-4 w-4" />
              Upload Dataset
            </Link>
          </Button>
        </div>
      </DashboardHeader>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md">
            <Icons.document className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Sort by
            </p>
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Datasets</TabsTrigger>
            <TabsTrigger value="shared">Shared With Others</TabsTrigger>
            <TabsTrigger value="received">Shared With Me</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <DatasetList datasets={filteredAndSortedDatasets} isLoading={isLoading} error={error} onUnlink={handleUnlink} />
          </TabsContent>
          <TabsContent value="shared" className="space-y-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <Icons.lock className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No shared datasets</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven&apos;t shared any datasets with others yet. 
                  Choose a dataset and set permissions to share it.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="received" className="space-y-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <Icons.document className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No datasets shared with you</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No one has shared any datasets with you yet.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/discover">
                    <Icons.arrowRight className="mr-2 h-4 w-4" />
                    Discover Public Datasets
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}