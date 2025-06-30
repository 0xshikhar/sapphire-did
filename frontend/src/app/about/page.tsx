import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "About - Sapphire",
  description: "About the Sapphire decentralized identifier (DID) system",
}

export default function AboutPage() {
  return (
    <div className="container relative px-4 md:px-8 pb-8 pt-6 md:pb-12 md:pt-10 mx-auto">
      <div className="flex flex-col items-center text-center space-y-4 mb-10">
        <div className="bg-primary/10 p-3 rounded-full">
          <Icons.fingerprint className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          About Sapphire
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          A GDPR-compliant Decentralized Identifier (DID) system for cultural heritage data
        </p>
      </div>

      <Separator className="my-8" />
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>Empowering users with data sovereignty</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Sapphire aims to develop a scalable, GDPR-compliant Decentralized Identifier (DID) system 
              as a sustainable, user-centric addition to existing persistent identifier infrastructures like 
              DOI and Handle. We empower users with control over their personal metadata while enhancing 
              data accessibility.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Standards Compliance</CardTitle>
            <CardDescription>Built on established technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Our platform is built on the open-source Dataverse framework and integrates with Harvard Dataverse. 
              We adhere to W3C Decentralized Identifiers (DIDs) standards, support DOI and Handle systems, 
              and maintain full compliance with GDPR and W3C VC standards.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Open Source</CardTitle>
            <CardDescription>Collaborative development</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Sapphire is developed under the MIT License as an open-source project. We believe in transparent, 
              collaborative development that fosters innovation and ensures our technology remains accessible 
              to all stakeholders in the cultural heritage space.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-md h-fit">
                <Icons.fingerprint className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Decentralized Identity</h3>
                <p className="text-muted-foreground">
                  Create and manage W3C-compliant Decentralized Identifiers (DIDs) that give you full ownership of your digital identity
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-md h-fit">
                <Icons.shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">GDPR Compliance</h3>
                <p className="text-muted-foreground">
                  Built with privacy by design, ensuring all operations adhere to European data protection regulations
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-md h-fit">
                <Icons.database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Data Vault</h3>
                <p className="text-muted-foreground">
                  Securely store and manage cultural heritage data with fine-grained access controls and permissions
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-md h-fit">
                <Icons.sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Integration</h3>
                <p className="text-muted-foreground">
                  Leverage AI for metadata extraction, content categorization, and recommendation systems
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Our Priorities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-foreground">
              <span className="font-medium">Inclusivity:</span> Ensuring our platform is accessible to cultural institutions of all sizes
            </li>
            <li className="text-foreground">
              <span className="font-medium">Security:</span> Implementing best-in-class security measures to protect sensitive cultural data
            </li>
            <li className="text-foreground">
              <span className="font-medium">Sustainability:</span> Creating an environmentally and economically sustainable solution
            </li>
            <li className="text-foreground">
              <span className="font-medium">User Empowerment:</span> Giving individuals control over their personal metadata
            </li>
            <li className="text-foreground">
              <span className="font-medium">Community Engagement:</span> Fostering collaboration among cultural heritage stakeholders
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Get Started with Sapphire</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard" 
            className={buttonVariants({ 
              variant: "default", 
              size: "lg"
            })}
          >
            Try the Platform
          </Link>
          <Link 
            href={siteConfig.links.docs || "#"} 
            className={buttonVariants({ 
              variant: "outline", 
              size: "lg"
            })}
          >
            Read the Docs
          </Link>
        </div>
      </div>
    </div>
  )
}
