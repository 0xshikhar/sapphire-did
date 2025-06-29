"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatasetRecommendations } from "@/components/dataverse/dataset-recommendations"

import { harvardDataverse, type DataverseDataset, type FilesSubset } from "@/services/dataverse.service"

export default function DatasetDetailPage() {
    const params = useParams()
    const router = useRouter()
    const datasetId = decodeURIComponent(params.id as string)

    const [dataset, setDataset] = useState<DataverseDataset | null>(null)
    const [files, setFiles] = useState<Array<{
        id: number;
        name: string;
        contentType?: string;
        description?: string;
        size?: number;
        url?: string;
    }>>([])    
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDataset = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Fetch dataset details
                const datasetDetails = await harvardDataverse.getDataset(datasetId)
                setDataset(datasetDetails)

                // Fetch dataset files
                const datasetFiles = await harvardDataverse.getDatasetFiles(datasetId)
                
                // Extract files from the API response structure
                if (datasetFiles && datasetFiles.data && Array.isArray(datasetFiles.data.files)) {
                    setFiles(datasetFiles.data.files.map((file: any) => ({
                        id: file.id || 0,
                        name: file.name || 'Unknown file',
                        contentType: file.contentType,
                        description: file.description,
                        size: file.size || 0,
                        url: file.downloadUrl || '#'
                    })))
                } else {
                    setFiles([])
                }

                setIsLoading(false)
            } catch (err) {
                console.error("Error fetching dataset details:", err)
                setError("Failed to load dataset details. Please try again later.")
                setIsLoading(false)
            }
        }

        fetchDataset()
    }, [datasetId])

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown"
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatFileSize = (bytes: number) => {
        if (!bytes) return "Unknown"
        const units = ['B', 'KB', 'MB', 'GB', 'TB']
        let size = bytes
        let unitIndex = 0

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024
            unitIndex++
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading={isLoading ? "Loading Dataset..." : dataset?.name || "Dataset Details"}
                description={isLoading ? "Fetching dataset information from Harvard Dataverse" : "Detailed information about this dataset from Harvard Dataverse"}
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.back()}>
                        <Icons.arrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/dataverse/link/${encodeURIComponent(datasetId || '')}`}>
                            <Icons.link className="mr-2 h-4 w-4" />
                            Link to DID
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href={`/dashboard/dataverse/enhance/${encodeURIComponent(datasetId || '')}`}>
                            <Icons.sparkles className="mr-2 h-4 w-4" />
                            AI Enhance
                        </Link>
                    </Button>
                </div>
            </DashboardHeader>

            {/* Main content area with two columns on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content - takes up 2/3 of the width on large screens */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {error && (
                        <Alert variant="destructive">
                            <Icons.alertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-4 w-1/2 mt-2" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-1/3" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : dataset ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">{dataset.name}</CardTitle>
                                    <CardDescription>
                                        {dataset.publisher} • Published {formatDate(dataset.published_at || '')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-1">Description</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {dataset.description || "No description available."}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-1">Identifier</h3>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            {dataset.global_id || "Unknown"}
                                        </p>
                                    </div>

                                    {dataset.subjects && dataset.subjects.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-1">Subjects</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {dataset.subjects.map((subject: any, i: number) => (
                                                    <Badge key={i} variant="secondary">{subject}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-medium mb-1">Citation</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {dataset.citation || "Citation not available."}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={dataset.global_id || '#'} target="_blank" rel="noopener noreferrer">
                                            <Icons.externalLink className="mr-2 h-4 w-4" />
                                            View on Dataverse
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Files</CardTitle>
                                    <CardDescription>
                                        Files associated with this dataset
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {files && files.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Format</TableHead>
                                                    <TableHead>Size</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {files.map((file) => (
                                                    <TableRow key={file.id}>
                                                        <TableCell className="font-medium">{file.name}</TableCell>
                                                        <TableCell>{file.description || "—"}</TableCell>
                                                        <TableCell>{file.contentType || "—"}</TableCell>
                                                        <TableCell>{file.size ? formatFileSize(file.size) : '—'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <a href={file.url || '#'} target="_blank" rel="noopener noreferrer">
                                                                    <Icons.download className="h-4 w-4" />
                                                                    <span className="sr-only">Download</span>
                                                                </a>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Icons.file className="h-10 w-10 text-muted-foreground mb-2" />
                                            <h3 className="font-medium">No files available</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                This dataset does not have any associated files.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
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

                {/* Recommendations column - takes up 1/3 of the width on large screens */}
                <div className="lg:col-span-1">
                    {!isLoading && dataset && (
                        <DatasetRecommendations 
                            dataset={dataset} 
                            additionalDatasets={[]} 
                            maxRecommendations={3}
                        />
                    )}
                </div>
            </div>
        </DashboardShell>
    )
}