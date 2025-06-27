"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

interface Stats {
  totalDatasets: number
  totalStorage: string
  activePermissions: number
  gdprRequests: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalDatasets: 0,
    totalStorage: "0 MB",
    activePermissions: 0,
    gdprRequests: 0
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch this data from the API
    const fetchStats = async () => {
      try {
        // Mock data for demonstration
        setStats({
          totalDatasets: 14,
          totalStorage: "2.3 GB",
          activePermissions: 7,
          gdprRequests: 2
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Datasets
          </CardTitle>
          <Icons.document className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "-" : stats.totalDatasets}</div>
          <p className="text-xs text-muted-foreground">
            Cultural heritage artifacts in your vault
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Storage Used
          </CardTitle>
          <Icons.vault className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "-" : stats.totalStorage}</div>
          <p className="text-xs text-muted-foreground">
            Total storage space utilized
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Permissions
          </CardTitle>
          <Icons.lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "-" : stats.activePermissions}</div>
          <p className="text-xs text-muted-foreground">
            Access rights granted to others
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            GDPR Requests
          </CardTitle>
          <Icons.user className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "-" : stats.gdprRequests}</div>
          <p className="text-xs text-muted-foreground">
            Pending data access or deletion requests
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
