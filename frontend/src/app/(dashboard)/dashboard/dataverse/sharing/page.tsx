'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { User, Shield, X } from 'lucide-react'
import { getSharingData, revokeShare } from '@/services/sharing.service'

export default function SharingManagementPage() {
  const [sharedByUser, setSharedByUser] = useState<any[]>([])
  const [sharedWithUser, setSharedWithUser] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const data = await getSharingData()
      setSharedByUser(data.sharedByUser)
      setSharedWithUser(data.sharedWithUser)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleRevoke = async (shareId: string) => {
    const result = await revokeShare(shareId)
    if (result.success) {
      toast.success(result.message)
      setSharedByUser(prev => prev.filter(share => share.id !== shareId))
    } else {
      toast.error('Failed to revoke share.')
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading sharing information...</div>
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Manage Sharing</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Datasets Shared by You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedByUser.length > 0 ? (
              sharedByUser.map(share => (
                <div key={share.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-semibold">{share.dataset.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" /> Shared with: {share.sharedWith.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Permission: {share.permission}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleRevoke(share.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Revoke
                  </Button>
                </div>
              ))
            ) : (
              <p>You haven&apos;t shared any datasets.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datasets Shared with You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedWithUser.length > 0 ? (
              sharedWithUser.map(share => (
                <div key={share.id} className="p-3 bg-secondary rounded-lg">
                  <p className="font-semibold">{share.dataset.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Shared by: {share.sharedBy.email}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Permission: {share.permission}
                  </p>
                </div>
              ))
            ) : (
              <p>No datasets have been shared with you.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
