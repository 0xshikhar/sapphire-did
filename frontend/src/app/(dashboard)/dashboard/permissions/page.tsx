"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const datasets = [
  {
    id: "1",
    title: "Medieval Manuscript Collection",
    permissions: [
      { id: "perm1", userId: "user1", userEmail: "john@example.com", access: "view" },
      { id: "perm2", userId: "user2", userEmail: "sarah@example.com", access: "edit" },
    ]
  },
  {
    id: "2",
    title: "Archaeological Findings - Roman Era",
    permissions: [
      { id: "perm3", userId: "user3", userEmail: "mark@example.com", access: "view" },
    ]
  },
  {
    id: "3",
    title: "Folk Music Recordings (1920-1940)",
    permissions: []
  }
]

const permissionFormSchema = z.object({
  dataset: z.string({
    required_error: "Please select a dataset",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  accessLevel: z.string({
    required_error: "Please select an access level",
  }),
})

type PermissionFormValues = z.infer<typeof permissionFormSchema>

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState("manage")
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      dataset: "",
      email: "",
      accessLevel: "view",
    },
  })

  // Handle granting permissions
  const onSubmit = async (data: PermissionFormValues) => {
    setIsLoading(true)
    try {
      // This would be an actual API call in production
      // const response = await fetch('/api/permissions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      // if (!response.ok) throw new Error('Failed to set permissions')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.info("Permission granted", {
        description: `Access granted to ${data.email} for the selected dataset`,
      })
      
      form.reset()
    } catch (error) {
      console.error(error)
      toast.error("Failed to grant permission")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle revoking permissions
  const handleRevokePermission = async (datasetId: string, permissionId: string, email: string) => {
    setIsLoading(true)
    try {
      // This would be an actual API call in production
      // const response = await fetch(`/api/permissions/${permissionId}`, {
      //   method: 'DELETE'
      // })
      // if (!response.ok) throw new Error('Failed to revoke permission')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.info("Permission revoked", {
        description: `Access revoked for ${email}`,
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to revoke permission")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle GDPR data access request
  const handleGDPRRequest = async (requestType: string) => {
    setIsLoading(true)
    try {
      // This would be an actual API call in production
      // const response = await fetch('/api/gdpr/requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type: requestType })
      // })
      // if (!response.ok) throw new Error('Failed to submit GDPR request')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.info("Request submitted", {
        description: requestType === "export" 
          ? "Your data export request has been submitted. You will receive an email with your data soon." 
          : "Your deletion request has been submitted and will be processed within 30 days.",
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to submit request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Permissions & GDPR"
        description="Manage dataset access permissions and GDPR compliance"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Permissions</TabsTrigger>
          <TabsTrigger value="grant">Grant Access</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR Controls</TabsTrigger>
        </TabsList>
        
        {/* Manage existing permissions */}
        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {datasets.map((dataset) => (
              <Card key={dataset.id}>
                <CardHeader>
                  <CardTitle>{dataset.title}</CardTitle>
                  <CardDescription>
                    {dataset.permissions.length} active permission(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dataset.permissions.length > 0 ? (
                    <ul className="space-y-2">
                      {dataset.permissions.map((permission) => (
                        <li key={permission.id} className="flex items-center justify-between rounded-md border p-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {permission.userEmail}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant={permission.access === "edit" ? "default" : "secondary"}>
                                {permission.access === "edit" ? "Editor" : "Viewer"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokePermission(dataset.id, permission.id, permission.userEmail)}
                            disabled={isLoading}
                          >
                            <Icons.trash className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Revoke</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                      No permissions granted for this dataset
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedDataset(dataset.id)
                      setActiveTab("grant")
                      form.setValue("dataset", dataset.id)
                    }}
                  >
                    <Icons.add className="mr-2 h-4 w-4" />
                    Add Permissions
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Grant new permissions */}
        <TabsContent value="grant">
          <Card>
            <CardHeader>
              <CardTitle>Grant Dataset Access</CardTitle>
              <CardDescription>
                Share access to your datasets with other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="dataset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dataset</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dataset" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {datasets.map((dataset) => (
                              <SelectItem key={dataset.id} value={dataset.id}>
                                {dataset.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose which dataset to grant access to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the email address of the user to grant access
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="view">View Only</SelectItem>
                            <SelectItem value="edit">Edit Access</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set what the user can do with the dataset
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Icons.arrowRight className="mr-2 h-4 w-4 animate-spin" />
                          Granting Access
                        </>
                      ) : (
                        <>Grant Access</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* GDPR compliance controls */}
        <TabsContent value="gdpr">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>GDPR Data Controls</CardTitle>
                <CardDescription>
                  Manage your data rights under GDPR regulations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Icons.download className="mt-1 h-5 w-5 text-primary" />
                    <div className="space-y-1">
                      <p className="text-base font-medium leading-none">
                        Export Your Data
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Request a copy of all your personal data stored in the system.
                        You&apos;ll receive an email with a download link within 48 hours.
                      </p>
                      <Button 
                        onClick={() => handleGDPRRequest("export")} 
                        variant="outline" 
                        className="mt-2"
                        disabled={isLoading}
                      >
                        Request Data Export
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Icons.trash className="mt-1 h-5 w-5 text-destructive" />
                    <div className="space-y-1">
                      <p className="text-base font-medium leading-none">
                        Request Data Deletion
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Request the deletion of all your personal data from our system.
                        This action cannot be undone and will remove all your datasets.
                      </p>
                      <Button 
                        onClick={() => handleGDPRRequest("delete")} 
                        variant="destructive" 
                        className="mt-2"
                        disabled={isLoading}
                      >
                        Request Deletion
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Icons.clock className="mt-1 h-5 w-5" />
                    <div className="space-y-1">
                      <p className="text-base font-medium leading-none">
                        Recent Requests
                      </p>
                      <div className="text-sm text-muted-foreground mt-2">
                        <p>No recent requests found</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Processing Activity Log</CardTitle>
                <CardDescription>
                  Transparency record of data processing activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Icons.login className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Authentication</p>
                      <p className="text-xs text-muted-foreground">
                        Last login: {new Date().toLocaleDateString()}, {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Icons.document className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Dataset Access</p>
                      <p className="text-xs text-muted-foreground">
                        3 datasets accessed in last 30 days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-md border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Icons.fingerprint className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">DID Management</p>
                      <p className="text-xs text-muted-foreground">
                        Last DID document update: 3 days ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
