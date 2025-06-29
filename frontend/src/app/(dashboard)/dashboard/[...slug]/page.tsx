'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { DashboardShell } from '@/components/dashboard/shell'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function CatchAllPage({ params }: { params: { slug: string[] } }) {
  const router = useRouter()
  const { authenticated, ready } = usePrivy()
  
  // Authentication check
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login')
    }
  }, [authenticated, ready, router])

  // Join the slug array to display the attempted path
  const attemptedPath = `/dashboard/${params.slug.join('/')}`

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Page Not Found"
        description="The page you're looking for doesn't exist or is under development"
      />
      
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Page Not Available</AlertTitle>
          <AlertDescription>
            The requested page <code>{attemptedPath}</code> could not be found.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard Home
          </Button>
        </div>
      </div>
    </DashboardShell>
  )
}
