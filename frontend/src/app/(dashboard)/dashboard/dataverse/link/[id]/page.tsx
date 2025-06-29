"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { harvardDataverse } from "@/services/dataverse.service"
import { metadataMapper, DatasetServiceEndpoint, MappedMetadata } from "@/services/metadata-mapping.service"
import { doiMappingService } from "@/services/doi-mapping.service"
import { Dataset } from "@iqss/dataverse-client-javascript"
import { toast } from "sonner"

// Extended Dataset interface with the properties we need to access
interface DatasetExtended extends Dataset {
    title?: string
    global_id?: string
    publisher?: string
    creators?: { name: string }[]
}

// Define form schema with proper types
const formSchema = z.object({
    didUrl: z.string().min(1, "DID URL is required"),
    createService: z.boolean().default(false),
    serviceDescription: z.string().optional(),
    createDoiMapping: z.boolean().default(true),
    mappingDescription: z.string().optional(),
    mappingType: z.enum(["dataset", "collection", "publication"]).default("dataset"),
    consent: z.boolean().default(false).refine(value => value === true, {
        message: "You must consent to link your DID to this dataset",
    }),
})

// Explicitly define the FormValues type that matches the form schema structure
type FormValues = {
    didUrl: string;
    createService: boolean;
    createDoiMapping: boolean;
    mappingType: "dataset" | "collection" | "publication";
    consent: boolean;
    serviceDescription?: string;
    mappingDescription?: string;
}

export default function LinkDatasetPage() {
    const params = useParams()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [dataset, setDataset] = useState<DatasetExtended | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [userDids, setUserDids] = useState<string[]>([])
    const [hasMetadataService, setHasMetadataService] = useState<boolean>(false)
    const datasetId = params.id as string

    // Initialize form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            didUrl: "",
            createService: false,
            serviceDescription: "",
            createDoiMapping: true,
            mappingDescription: "",
            mappingType: "dataset",
            consent: false,
        },
    })

    // Watch form values for conditional fields
    const createService = form.watch("createService")
    const createDoiMapping = form.watch("createDoiMapping")

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)

                // Get dataset details from Harvard Dataverse
                if (datasetId) {
                    const datasetDetails = await harvardDataverse.getDataset(datasetId)
                    setDataset(datasetDetails as DatasetExtended)
                }

                // Get user DIDs (mock data for now) - implement this method
                const userDidList = await Promise.resolve(['did:ethr:0x1234', 'did:web:example.com'])
                setUserDids(userDidList)

                // Check if the DID already has a metadata service for this dataset
                // This would be implemented in a real scenario to show existing mappings
                setHasMetadataService(false)
            } catch (err) {
                console.error("Error fetching data:", err)
                setError("Failed to load dataset information. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [datasetId])

    // Define the submit handler for the form
    const onSubmit = async (values: FormValues) => {
        try {
            setIsSaving(true)

            if (!dataset) {
                throw new Error("Dataset information not found")
            }

            // Record linking in metadata service if requested
            if (values.createService) {
                const serviceData: DatasetServiceEndpoint = {
                    id: `dataset-${datasetId}`,
                    type: "DatasetService",
                    serviceEndpoint: dataset.global_id || "",
                    description: values.serviceDescription || `Dataset from Harvard Dataverse: ${dataset.title}`,
                }

                // For now, just log the action since addServiceEndpoint is not implemented
                console.log(`Adding service endpoint to DID ${values.didUrl}`, serviceData)
                // In production, this would call the actual method:
                // await metadataMapper.addServiceEndpoint(values.didUrl, serviceData)
            }

            // Create DOI to DID mapping if requested
            if (values.createDoiMapping && dataset.global_id) {
                const doi = dataset.global_id.replace(/^doi:/, "")

                await doiMappingService.createMapping(
                    doi,
                    values.didUrl,
                    values.mappingType,
                    values.mappingDescription || ""
                )
            }

            // Record GDPR consent
            if (values.consent) {
                // Create a simple metadata object for consent recording
                const metadata = {
                    name: dataset?.title || 'Dataset',
                    identifier: datasetId,
                    source: 'Harvard Dataverse',
                    consentRecorded: false
                };
                
                // Call the correct method name recordGDPRConsent instead of recordGdprConsent
                await metadataMapper.recordGDPRConsent(metadata, `Dataset linking for ${datasetId}`)
            }

            toast.success("Dataset successfully linked to your DID")
            router.push("/dashboard/dataverse")
        } catch (error) {
            console.error("Error linking dataset:", error)
            toast.error("Failed to link dataset. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Link Dataset to DID"
                description="Connect your decentralized identity to a dataset"
            />

            <div className="grid gap-8">
                {isLoading ? (
                    <Card>
                        <CardHeader>
                            <CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle>
                            <CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : dataset ? (
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dataset Information</CardTitle>
                                <CardDescription>Details about the dataset you are linking</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div>
                                        <h3 className="text-lg font-medium">{dataset.title}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="secondary">{dataset.publisher}</Badge>
                                            <Badge variant="outline">{dataset.global_id}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>Created by: {dataset.creators?.map(creator => creator.name).join(", ") || "Unknown"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>DID Selection</CardTitle>
                                        <CardDescription>
                                            Select your DID to link with this dataset
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="didUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>DID URL</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a DID" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {userDids.map((did) => (
                                                                <SelectItem key={did} value={did}>
                                                                    {did}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Your decentralized identifier that will be linked to this dataset
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="createService"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Create service endpoint in DID Document
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Add a reference to this dataset in your DID Document service section
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        {createService && (
                                            <FormField
                                                control={form.control}
                                                name="serviceDescription"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Service Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Describe the purpose of this dataset service"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            This will be added to your DID Document service section
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="createDoiMapping"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Create explicit DOI to DID mapping
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Register this dataset&apos;s DOI with your DID in the mapping service
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        {createDoiMapping && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="mappingType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Mapping Type</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select mapping type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="dataset">Dataset</SelectItem>
                                                                    <SelectItem value="collection">Collection</SelectItem>
                                                                    <SelectItem value="publication">Publication</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription>
                                                                The type of relationship between your DID and this dataset
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="mappingDescription"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Mapping Description</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Describe the relationship between your DID and this dataset"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Optional details about the mapping
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="consent"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            I consent to link my DID with this dataset
                                                        </FormLabel>
                                                        <FormDescription>
                                                            This consent is required by GDPR regulations and will be recorded
                                                        </FormDescription>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            disabled={isSaving || !form.formState.isValid}
                                        >
                                            {isSaving && (
                                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Link Dataset
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>
                        </Form>
                    </div>
                ) : (
                    <Alert variant="destructive">
                        <AlertTitle>Dataset Not Found</AlertTitle>
                        <AlertDescription>The requested dataset could not be found.</AlertDescription>
                    </Alert>
                )}
            </div>
        </DashboardShell>
    )
}