"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch this data from the API
    const fetchActivities = async () => {
      try {
        // Mock data for demonstration
        setActivities([
          {
            id: "act-1",
            type: "did_update",
            description: "DID document was updated",
            timestamp: "2 hours ago"
          },
          {
            id: "act-2",
            type: "dataset_upload",
            description: "New dataset 'Roman Artifacts Collection' was uploaded",
            timestamp: "1 day ago"
          },
          {
            id: "act-3",
            type: "permission_granted",
            description: "Access granted to National Museum",
            timestamp: "2 days ago"
          },
          {
            id: "act-4",
            type: "gdpr_request",
            description: "Data export request received",
            timestamp: "3 days ago"
          },
        ])
      } catch (error) {
        console.error("Failed to fetch activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-muted-foreground">Loading activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-muted-foreground">No recent activity found</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start space-x-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary" />
                <div className="space-y-1">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
