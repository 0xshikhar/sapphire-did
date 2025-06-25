import Link from "next/link"
import Image from "next/image"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Sapphire</span>: Decentralized Identity for Cultural Heritage
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  A GDPR-compliant Decentralised Identifier (DID) system empowering users with control over their cultural heritage data.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Get Started
                </Link>
                <Link
                  href="/about"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-[450px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full blur-3xl opacity-20"></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="w-4/5 h-4/5 bg-muted rounded-lg shadow-2xl overflow-hidden flex items-center justify-center p-6">
                    <Icons.fingerprint className="w-40 h-40 text-primary opacity-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Empowering Data Ownership
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sapphire provides the tools you need to manage and share cultural heritage data with confidence.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <div className="grid gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                <Icons.fingerprint className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">DID Management</h3>
              <p className="text-muted-foreground">
                Create and manage W3C-compliant Decentralized Identifiers for users and datasets with cryptographic security.
              </p>
            </div>
            <div className="grid gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                <Icons.lock className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">GDPR Compliance</h3>
              <p className="text-muted-foreground">
                Full control over your personal data with consent management, right to be forgotten, and audit logging.
              </p>
            </div>
            <div className="grid gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                <Icons.sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI Integration</h3>
              <p className="text-muted-foreground">
                Intelligent metadata extraction, content categorization, and recommendation systems for cultural artifacts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
                User Journey
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                How Sapphire Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform simplifies the management of cultural heritage data through decentralized identity.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-10 py-12">
            <ol className="grid gap-8 md:grid-cols-3">
              <li className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Create Your DID</h3>
                  <p className="text-muted-foreground">
                    Register an account and get your own Decentralized Identifier for secure identity management.
                  </p>
                </div>
              </li>
              <li className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Upload Your Data</h3>
                  <p className="text-muted-foreground">
                    Add cultural heritage datasets with rich metadata and AI-powered automated categorization.
                  </p>
                </div>
              </li>
              <li className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Control Access</h3>
                  <p className="text-muted-foreground">
                    Manage permissions and control exactly who can access your cultural heritage data and metadata.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Take Control of Your Cultural Heritage Data?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join Sapphire today and revolutionize how you manage, share, and preserve cultural artifacts.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
