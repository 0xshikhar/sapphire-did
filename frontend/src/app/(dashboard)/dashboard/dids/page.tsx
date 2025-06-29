"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { usePrivy } from "@privy-io/react-auth"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

// Types for DIDs based on W3C DID standard
interface VerificationMethod {
  id: string
  type: string
  controller: string
  publicKeyMultibase?: string
}

interface Service {
  id: string
  type: string
  serviceEndpoint: string
}

interface DIDDocument {
  id: string
  controller: string
  verificationMethod?: VerificationMethod[]
  service?: Service[]
  version: number
  created: string
  updated: string
}

const serviceFormSchema = z.object({
  type: z.string().min(1, "Service type is required"),
  serviceEndpoint: z.string().url("Must be a valid URL"),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

export default function DIDsPage() {
  const [didDocument, setDidDocument] = useState<DIDDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [addingService, setAddingService] = useState(false)

  const serviceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      type: "",
      serviceEndpoint: "",
    },
  })

  const router = useRouter()
  const { authenticated, user } = usePrivy()

  useEffect(() => {
    const fetchDID = async () => {
      try {
        if (!authenticated || !user) {
          router.push("/login")
          return
        }

        // Get wallet address from Privy user
        const walletAddress = user.wallet?.address
        if (!walletAddress) {
          toast.error("No wallet connected")
          return
        }

        // Create a DID from the wallet address
        const did = `did:ethr:${walletAddress}`

        // This would be an actual API call in production
        // const response = await fetch(`/api/dids/${did}`)
        // if (!response.ok) throw new Error('Failed to fetch DID document')
        // const data = await response.json()
        
        // Mock data for demonstration
        setDidDocument({
          id: did,
          controller: did,
          verificationMethod: [
            {
              id: `${did}#keys-1`,
              type: "Ed25519VerificationKey2020",
              controller: did,
              publicKeyMultibase: "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
            }
          ],
          service: [
            {
              id: `${did}#linked-domain`,
              type: "LinkedDomains",
              serviceEndpoint: "https://example.com",
            }
          ],
          version: 1,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error fetching DID document:", error)
        toast.error("Failed to load DID document")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDID()
  }, [authenticated, router, user])

  async function onAddService(data: ServiceFormValues) {
    setAddingService(true)
    try {
      // This would be an actual API call in production
      // const response = await fetch(`/api/dids/${didDocument?.id}/services`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      // if (!response.ok) throw new Error('Failed to add service')
      
      // Update local state for demo
      if (didDocument) {
        const newService = {
          id: `${didDocument.id}#service-${Date.now()}`,
          type: data.type,
          serviceEndpoint: data.serviceEndpoint,
        }
        
        setDidDocument({
          ...didDocument,
          service: [...(didDocument.service || []), newService],
          updated: new Date().toISOString(),
        })
      }
      
      toast.info("Service added", {
        description: "Service has been added to your DID document",
      })
      
      serviceForm.reset()
      setAddingService(false)
    } catch (error) {
      console.error("Error adding service:", error)
      toast.error("Failed to add service to DID document")
      setAddingService(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Your Digital Identity"
        description="Manage your W3C compliant Decentralized Identifiers (DIDs)"
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Icons.arrowRight className="h-8 w-8 animate-spin" />
        </div>
      ) : !didDocument ? (
        <Card>
          <CardHeader>
            <CardTitle>No DID found</CardTitle>
            <CardDescription>
              You don&apos;t have a DID associated with your account yet.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button>Create a new DID</Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="verification">Verification Methods</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>DID Document</CardTitle>
                <CardDescription>
                  Your primary decentralized identifier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium">DID</p>
                  <p className="break-all rounded-md bg-secondary p-2 text-sm font-mono">
                    {didDocument.id}
                  </p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium">Controller</p>
                  <p className="break-all rounded-md bg-secondary p-2 text-sm font-mono">
                    {didDocument.controller}
                  </p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium">Created</p>
                  <p className="rounded-md bg-secondary p-2 text-sm">
                    {new Date(didDocument.created).toLocaleString()}
                  </p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="rounded-md bg-secondary p-2 text-sm">
                    {new Date(didDocument.updated).toLocaleString()}
                  </p>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium">Version</p>
                  <p className="rounded-md bg-secondary p-2 text-sm">
                    {didDocument.version}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="verification">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Verification Methods</CardTitle>
                  <CardDescription>
                    Cryptographic keys and verification methods associated with your DID
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Icons.fingerprint className="mr-2 h-4 w-4" />
                  Add Key
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {didDocument.verificationMethod?.map((method) => (
                  <div 
                    key={method.id} 
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{method.type}</p>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-xs text-muted-foreground">ID</p>
                      <p className="break-all text-sm font-mono">{method.id}</p>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-xs text-muted-foreground">Controller</p>
                      <p className="break-all text-sm font-mono">{method.controller}</p>
                    </div>
                    {method.publicKeyMultibase && (
                      <div className="grid gap-1">
                        <p className="text-xs text-muted-foreground">Public Key</p>
                        <p className="break-all text-sm font-mono">{method.publicKeyMultibase}</p>
                      </div>
                    )}
                  </div>
                ))}
                {(!didDocument.verificationMethod || didDocument.verificationMethod.length === 0) && (
                  <div className="text-center p-4 text-muted-foreground">
                    No verification methods found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="services">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>
                    Services associated with your DID
                  </CardDescription>
                </div>
                <Button onClick={() => setAddingService(true)} variant="outline">
                  <Icons.document className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {addingService && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">Add a new service</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...serviceForm}>
                        <form onSubmit={serviceForm.handleSubmit(onAddService)} className="space-y-4">
                          <FormField
                            control={serviceForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Type</FormLabel>
                                <FormControl>
                                  <Input placeholder="LinkedDomains" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Enter the type of service (e.g., LinkedDomains, VerifiableCredentialService)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="serviceEndpoint"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Endpoint</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Enter the URL of the service endpoint
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => setAddingService(false)} variant="ghost" type="button">
                              Cancel
                            </Button>
                            <Button type="submit">
                              Add Service
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
                {didDocument.service?.map((service) => (
                  <div 
                    key={service.id} 
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{service.type}</p>
                      <Button variant="ghost" size="sm">
                        <Icons.settings className="h-4 w-4" />
                        <span className="sr-only">Settings</span>
                      </Button>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-xs text-muted-foreground">ID</p>
                      <p className="break-all text-sm">{service.id}</p>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-xs text-muted-foreground">Endpoint</p>
                      <p className="break-all text-sm">{service.serviceEndpoint}</p>
                    </div>
                  </div>
                ))}
                {(!didDocument.service || didDocument.service.length === 0) && !addingService && (
                  <div className="text-center p-4 text-muted-foreground">
                    No services found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Document History</CardTitle>
                <CardDescription>
                  View the version history of your DID document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-sm">1</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Initial Creation</p>
                      <p className="text-sm text-muted-foreground">{new Date(didDocument.created).toLocaleString()}</p>
                      <div className="rounded-md bg-secondary/50 p-2 mt-2">
                        <p className="text-xs">Created DID document with 1 verification method</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center">
                      <span className="text-muted-foreground font-medium text-sm">?</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">Future Updates</p>
                      <p className="text-sm text-muted-foreground">Changes to your DID document will appear here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </DashboardShell>
  )
}
