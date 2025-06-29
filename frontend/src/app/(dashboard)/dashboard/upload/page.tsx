"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Icons } from "@/components/icons"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// Define the form value type directly
interface UploadFormValues {
    title: string;
    description: string;
    category: string;
    tags: string;
    licenseType: string;
    isPublic: boolean;
    allowAnonymousAccess: boolean;
    gdprCompliance: boolean;
    dataPrivacyConsent: boolean;
}

// Default values for the form
const defaultValues: UploadFormValues = {
    title: "",
    description: "",
    category: "",
    tags: "",
    licenseType: "",
    isPublic: false,
    allowAnonymousAccess: false,
    gdprCompliance: false,
    dataPrivacyConsent: false
}

export default function UploadPage() {
    const router = useRouter()
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState<boolean>(false)

    const form = useForm<UploadFormValues>({
        defaultValues
    })

    const register = form.register
    const handleSubmit = form.handleSubmit
    const watch = form.watch

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files
        if (selectedFiles) {
            setFiles(Array.from(selectedFiles))
        }
    }

    const onSubmit = async (data: UploadFormValues) => {
        if (!files || files.length === 0) {
            toast.error("No files selected", {
                description: "Please select at least one file to upload",
            })
            return
        }

        setUploading(true)

        try {
            // This would be an actual API call in production
            // const formData = new FormData()
            // 
            // // Append form values to FormData
            // Object.entries(data).forEach(([key, value]) => {
            //   formData.append(key, String(value))
            // })
            // 
            // // Append files to FormData
            // for (let i = 0; i < files.length; i++) {
            //   formData.append('files', files[i])
            // }
            // 
            // const response = await fetch('/api/datasets/upload', {
            //   method: 'POST',
            //   body: formData,
            // })
            // 
            // if (!response.ok) {
            //   throw new Error('Upload failed')
            // }
            // 
            // const responseData = await response.json()

            // Simulating API response delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            toast.info("Upload successful", {
                description: "Your dataset has been uploaded and is now being processed",
            })

            router.push("/dashboard/data-vault")
        } catch (error) {
            console.error(error)
            toast.error("Upload failed", {
                description: "There was an error uploading your dataset. Please try again.",
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Upload Dataset"
                description="Upload and catalog your cultural heritage datasets with DID integration"
            />

            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dataset Information</CardTitle>
                                <CardDescription>
                                    Provide details about your cultural heritage dataset
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter dataset title" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    A descriptive title for your dataset
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe the dataset, its purpose, and its cultural significance"
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Provide context and background information about your dataset
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Classification */}
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="artifacts">Artifacts</SelectItem>
                                                            <SelectItem value="documents">Historical Documents</SelectItem>
                                                            <SelectItem value="images">Images & Photography</SelectItem>
                                                            <SelectItem value="audio">Audio Recordings</SelectItem>
                                                            <SelectItem value="manuscripts">Manuscripts</SelectItem>
                                                            <SelectItem value="maps">Maps & Cartography</SelectItem>
                                                            <SelectItem value="artwork">Artwork</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="licenseType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>License Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a license" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="cc0">CC0 - Public Domain</SelectItem>
                                                            <SelectItem value="cc-by">CC BY - Attribution</SelectItem>
                                                            <SelectItem value="cc-by-sa">CC BY-SA - Attribution-ShareAlike</SelectItem>
                                                            <SelectItem value="cc-by-nc">CC BY-NC - Attribution-NonCommercial</SelectItem>
                                                            <SelectItem value="cc-by-nd">CC BY-ND - Attribution-NoDerivs</SelectItem>
                                                            <SelectItem value="cc-by-nc-sa">CC BY-NC-SA - Attribution-NonCommercial-ShareAlike</SelectItem>
                                                            <SelectItem value="cc-by-nc-nd">CC BY-NC-ND - Attribution-NonCommercial-NoDerivs</SelectItem>
                                                            <SelectItem value="custom">Custom License</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Specify how others can use your dataset
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="art, 18th-century, pottery (comma-separated)"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Add relevant tags to improve discoverability
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="space-y-4">
                                    <div>
                                        <FormLabel htmlFor="file-upload">Dataset Files</FormLabel>
                                        <div className="mt-1 flex justify-center rounded-lg border border-dashed border-input p-6">
                                            <div className="space-y-2 text-center">
                                                <Icons.upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                                <div className="flex text-sm leading-6 text-muted-foreground">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring"
                                                    >
                                                        <span>Upload files</span>
                                                        <Input
                                                            id="file-upload"
                                                            name="files[]"
                                                            type="file"
                                                            multiple
                                                            className="sr-only"
                                                            onChange={handleFileChange}
                                                            disabled={uploading}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Supported formats: CSV, JSON, XML, PDF, ZIP, XLSX (max 50MB)
                                                </p>
                                            </div>
                                        </div>
                                        {files && files.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm text-muted-foreground">
                                                    Selected files: {files.length}
                                                </p>
                                                <ul className="mt-1 max-h-32 overflow-auto text-sm">
                                                    {Array.from(files).map((file, index) => (
                                                        <li key={index} className="text-muted-foreground">
                                                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Access Settings</CardTitle>
                                <CardDescription>
                                    Configure who can access this dataset and how
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isPublic"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Public Dataset</FormLabel>
                                                <FormDescription>
                                                    Make this dataset discoverable by other users
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="allowAnonymousAccess"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Allow Anonymous Access</FormLabel>
                                                <FormDescription>
                                                    Allow access without requiring authentication
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={!form.getValues().isPublic}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>GDPR Compliance</CardTitle>
                                <CardDescription>
                                    Ensure your dataset complies with data protection regulations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="dataPrivacyConsent"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Personal Data Confirmation
                                                </FormLabel>
                                                <FormDescription>
                                                    I confirm that this dataset either contains no personal data, or all necessary consent has been obtained for sharing it.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gdprCompliance"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    GDPR Compliance
                                                </FormLabel>
                                                <FormDescription>
                                                    I understand that I am responsible for ensuring this dataset complies with GDPR and other applicable data protection regulations.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/dashboard/data-vault")}
                                type="button"
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={uploading}>
                                {uploading && (
                                    <Icons.arrowRight className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Upload Dataset
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardShell>
    )
}