"use client"

import Link from "next/link"
import { format } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import { Dataset } from "@/services/dataset.service"

interface DatasetListProps {
  datasets: Dataset[]
  isLoading: boolean
  error: string | null
  limit?: number
  onUnlink: (datasetId: string) => void
}

export function DatasetList({ datasets, isLoading, error, limit, onUnlink }: DatasetListProps) {

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Icons.spinner className="mr-2 h-6 w-6 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading datasets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
        <Icons.warning className="h-10 w-10 text-destructive" />
        <h3 className="mt-4 text-lg font-semibold text-destructive">Error</h3>
        <p className="mt-2 text-sm text-destructive/80">{error}</p>
      </div>
    )
  }

  if (datasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <Icons.document className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No datasets created</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven&apos;t uploaded any datasets yet. Start adding your cultural
            heritage data.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/upload">
              <Icons.upload className="mr-2 h-4 w-4" />
              Upload Dataset
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {datasets.map((dataset) => (
        <Card key={dataset.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{dataset.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {dataset.description || "No description available."}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {dataset.mimeType.split("/")[0] || "File"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Icons.document className="mr-1 h-3 w-3" />1 file
              </div>
              <div>{format(new Date(dataset.createdAt), "PPP")}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {dataset.aiTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Icons.settings className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/data-vault/${dataset.id}`}>
                    <Icons.info className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onSelect={() => onUnlink(dataset.id)}
                >
                  <Icons.trash className="mr-2 h-4 w-4" />
                  Unlink
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      ))}

      {limit && datasets.length >= limit && (
        <Button variant="ghost" asChild className="w-full">
          <Link href="/dashboard/data-vault">View All Datasets</Link>
        </Button>
      )}
    </div>
  )
}
