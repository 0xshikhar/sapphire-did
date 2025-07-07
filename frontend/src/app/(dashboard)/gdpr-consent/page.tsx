import { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "GDPR Consent",
  description: "Manage your privacy preferences and GDPR consent options for the Sapphire platform",
}

export default function GDPRConsentPage() {
  return (
    <div className="container relative pb-8 pt-6 md:pb-12 md:pt-10 mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">GDPR Consent Management</h1>
        <p className="text-muted-foreground">
          Control how your data is processed and stored on the Sapphire platform
        </p>
      </div>

      <Alert className="my-6 border-primary/50 bg-primary/10">
        <Icons.shield className="h-5 w-5 text-primary" />
        <AlertTitle>Your privacy is our priority</AlertTitle>
        <AlertDescription>
          As a GDPR-compliant DID system, Sapphire is committed to protecting your personal data and ensuring transparency in how it&apos;s used.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.fingerprint className="h-5 w-5" />
              DID Management Consent
            </CardTitle>
            <CardDescription>
              Control how your Decentralized Identifiers (DIDs) are created, managed, and stored
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="did-creation">DID Creation</Label>
                <p className="text-sm text-muted-foreground">
                  Allow Sapphire to create and manage DIDs on your behalf
                </p>
              </div>
              <Switch id="did-creation" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="did-history">DID History Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track the history of changes to your DIDs for verification purposes
                </p>
              </div>
              <Switch id="did-history" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="did-linking">External DID Linking</Label>
                <p className="text-sm text-muted-foreground">
                  Link your DIDs to external services and platforms
                </p>
              </div>
              <Switch id="did-linking" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Reset Preferences</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.database className="h-5 w-5" />
              Data Storage Consent
            </CardTitle>
            <CardDescription>
              Control how your data is stored and processed in the Data Vault
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="metadata-storage">Metadata Storage</Label>
                <p className="text-sm text-muted-foreground">
                  Store metadata about your cultural heritage assets
                </p>
              </div>
              <Switch id="metadata-storage" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Collect anonymized usage data to improve our services
                </p>
              </div>
              <Switch id="analytics" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="third-party">Third-Party Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow approved third parties to access your data with your explicit consent
                </p>
              </div>
              <Switch id="third-party" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Reset Preferences</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.sparkles className="h-5 w-5" />
              AI Processing Consent
            </CardTitle>
            <CardDescription>
              Control how AI technologies can interact with your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-metadata">AI Metadata Enhancement</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to enhance metadata for your cultural assets
                </p>
              </div>
              <Switch id="ai-metadata" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-recommendations">AI Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable AI-powered recommendations based on your data
                </p>
              </div>
              <Switch id="ai-recommendations" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-training">AI Model Training</Label>
                <p className="text-sm text-muted-foreground">
                  Allow your anonymized data to be used for improving AI models
                </p>
              </div>
              <Switch id="ai-training" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Reset Preferences</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.lock className="h-5 w-5" />
              User Rights Management
            </CardTitle>
            <CardDescription>
              Exercise your GDPR rights regarding your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3">
              <h3 className="font-medium">Right to Access</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Request a copy of all personal data we hold about you
              </p>
              <Button variant="outline" size="sm">Request Data Export</Button>
            </div>
            
            <div className="rounded-lg border p-3">
              <h3 className="font-medium">Right to Be Forgotten</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Request deletion of all your personal data from our systems
              </p>
              <Button variant="outline" size="sm" className="text-destructive">
                Request Account Deletion
              </Button>
            </div>
            
            <div className="rounded-lg border p-3">
              <h3 className="font-medium">Data Portability</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Export your data in a machine-readable format
              </p>
              <Button variant="outline" size="sm">Export Data</Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              For any other GDPR-related requests, please contact our Data Protection Officer at 
              <Link href="mailto:dpo@sapphire-did.com" className="text-primary ml-1">
                dpo@sapphire-did.com
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Privacy Policy & Terms</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link 
            href="/#-policy" 
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <Icons.document className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">
                  View our detailed privacy policy
                </p>
              </div>
            </div>
            <Icons.arrowRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          
          <Link 
            href="/#" 
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <Icons.document className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Terms of Service</h3>
                <p className="text-sm text-muted-foreground">
                  View our terms and conditions
                </p>
              </div>
            </div>
            <Icons.arrowRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  )
}
