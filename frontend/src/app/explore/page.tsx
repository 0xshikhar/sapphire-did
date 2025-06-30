import { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
    title: "Explore - Sapphire",
    description: "Discover cultural heritage data and DIDs on the Sapphire platform",
}

// Sample dataset entries for demonstration
const featuredDatasets = [
    {
        id: "ds-001",
        title: "Medieval Manuscripts Collection",
        institution: "National Library",
        items: 128,
        tags: ["manuscripts", "medieval", "europe"],
        thumbnail: "/placeholder-image.jpg",
    },
    {
        id: "ds-002",
        title: "Indigenous Art Archives",
        institution: "Cultural Heritage Museum",
        items: 94,
        tags: ["indigenous", "art", "artifacts"],
        thumbnail: "/placeholder-image.jpg",
    },
    {
        id: "ds-003",
        title: "Historical Photographs (1900-1950)",
        institution: "City Archives",
        items: 312,
        tags: ["photographs", "history", "20th century"],
        thumbnail: "/placeholder-image.jpg",
    },
    {
        id: "ds-004",
        title: "Ancient Pottery Collection",
        institution: "Archaeological Institute",
        items: 76,
        tags: ["archaeology", "pottery", "ancient"],
        thumbnail: "/placeholder-image.jpg",
    },
]

// Sample DID entries for demonstration
const recentDIDs = [
    {
        id: "did:sapphire:abcd1234",
        title: "Byzantine Artifacts Catalog",
        createdAt: "2025-06-28T14:35:00Z",
    },
    {
        id: "did:sapphire:efgh5678",
        title: "Renaissance Painting Collection",
        createdAt: "2025-06-27T09:22:00Z",
    },
    {
        id: "did:sapphire:ijkl9012",
        title: "Modern Architecture Archive",
        createdAt: "2025-06-26T16:40:00Z",
    },
]

export default function ExplorePage() {
    return (
        <div className="container relative px-4 md:px-8 pb-8 pt-6 md:pb-12 md:pt-10 mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Explore</h1>
                <p className="text-muted-foreground">
                    Discover cultural heritage data and decentralized identifiers
                </p>
            </div>

            {/* Search and filter section */}
            <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search collections, datasets, or DIDs..."
                        className="pl-8"
                    />
                </div>
                <Button>Advanced Search</Button>
            </div>

            <Tabs defaultValue="datasets" className="mt-8">
                <TabsList>
                    <TabsTrigger value="datasets">Datasets</TabsTrigger>
                    <TabsTrigger value="dids">DIDs</TabsTrigger>
                    <TabsTrigger value="institutions">Institutions</TabsTrigger>
                </TabsList>

                <TabsContent value="datasets" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {featuredDatasets.map((dataset) => (
                            <Card key={dataset.id}>
                                <CardHeader className="pb-3">
                                    <CardTitle>{dataset.title}</CardTitle>
                                    <CardDescription>
                                        {dataset.institution} • {dataset.items} items
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {dataset.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="outline" size="sm">View Details</Button>
                                    <Button size="sm">Access Data</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button variant="outline">View More Datasets</Button>
                    </div>
                </TabsContent>

                <TabsContent value="dids" className="mt-6">
                    <div className="rounded-md border">
                        <div className="grid grid-cols-[1fr_2fr_auto] px-4 py-3 text-sm font-medium">
                            <div>DID</div>
                            <div>Title</div>
                            <div>Created</div>
                        </div>
                        <Separator />
                        {recentDIDs.map((did, index) => (
                            <div key={did.id}>
                                <div className="grid grid-cols-[1fr_2fr_auto] items-center px-4 py-3">
                                    <div className="font-mono text-xs truncate">{did.id}</div>
                                    <div>{did.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(did.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                {index < recentDIDs.length - 1 && <Separator />}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button variant="outline">View More DIDs</Button>
                    </div>
                </TabsContent>

                <TabsContent value="institutions" className="mt-6">
                    <div className="rounded-md border p-8 text-center">
                        <h3 className="text-lg font-medium mb-2">Institution Directory Coming Soon</h3>
                        <p className="text-muted-foreground mb-6">
                            We&apos;re working on a comprehensive directory of cultural heritage institutions that use Sapphire.
                        </p>
                        <Button variant="outline">Request Early Access</Button>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-12 py-6 px-6 rounded-lg border bg-muted/40">
                <h2 className="text-xl font-semibold mb-2">Partner with Sapphire</h2>
                <p className="text-muted-foreground mb-4">
                    Are you a cultural heritage institution looking to implement a GDPR-compliant DID system?
                    Join our network of partners and enhance your digital preservation efforts.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/contact">
                        <Button variant="default">Contact Us</Button>
                    </Link>
                    <Link href="/documentation">
                        <Button variant="outline">Read Documentation</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
