'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { shareDataset } from '@/services/sharing.service'

export default function ShareDatasetPage() {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('VIEW')
  const [isLoading, setIsLoading] = useState(false)
  

  // We'll use a hardcoded dataset ID for now
  const datasetId = 'dummy-dataset-123'

  const handleShare = async () => {
    if (!email) {
      toast.error('Please enter an email address.')
      return
    }

    setIsLoading(true)
    try {
      const result = await shareDataset(datasetId, email, permission)
      if (result.success) {
        toast.success(result.message)
        setEmail('')
      } else {
        toast.error('Failed to share dataset.')
      }
    } catch (error) {
      toast.error('An unexpected error occurred.')
    }
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Share Dataset</h1>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">User&apos;s Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email of the user to share with"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="permission">Permission</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger id="permission">
                <SelectValue placeholder="Select permission level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="EDIT">Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleShare} disabled={isLoading}>
            {isLoading ? 'Sharing...' : 'Share Dataset'}
          </Button>
        </div>
      </div>
    </div>
  )
}
