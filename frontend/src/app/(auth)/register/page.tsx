"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { usePrivy, useWallets } from "@privy-io/react-auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [didCreated, setDidCreated] = useState(false)
    
    // Get Privy authentication state
    const { login, authenticated, ready, user, logout } = usePrivy()
    const { wallets } = useWallets()
    
    // Check if user is already authenticated with Privy
    useEffect(() => {
        if (ready && authenticated && user) {
            // If user is already authenticated but hasn't completed registration
            // (i.e., just connected wallet but no DID yet), don't redirect
            if (didCreated) {
                router.push("/dashboard")
            }
        }
    }, [ready, authenticated, user, router, didCreated])
    
    // Create DID when wallet is connected
    useEffect(() => {
        const createDid = async () => {
            // Only proceed if authenticated but DID not yet created
            if (authenticated && user && wallets.length > 0 && !didCreated && !isLoading) {
                try {
                    setIsLoading(true)
                    setError(null)
                    
                    // In a real implementation, we would make an API call to create a DID
                    // For now, we'll simulate it with a delay
                    await new Promise(resolve => setTimeout(resolve, 1500))
                    
                    // Mark DID as created
                    setDidCreated(true)
                    
                    toast.success("DID created successfully", { 
                        description: "Your decentralized identity is ready." 
                    })
                    
                    // Redirect to dashboard
                    router.push("/dashboard")
                    
                } catch (err) {
                    const errorMessage = err instanceof Error ? 
                        err.message : "Failed to create DID. Please try again."
                    setError(errorMessage)
                    toast.error("DID Creation Failed", { description: errorMessage })
                    
                    // On error, allow user to try again by logging out
                    await logout()
                } finally {
                    setIsLoading(false)
                }
            }
        }
        
        createDid()
    }, [authenticated, user, wallets, didCreated, isLoading, router, logout])

    // Handle wallet connection with Privy
    const handleConnectWallet = async () => {
        if (isLoading) return
        
        try {
            setIsLoading(true)
            setError(null)
            
            // Use Privy login to connect wallet
            await login()
            
        } catch (err) {
            const errorMessage = err instanceof Error ? 
                err.message : "Failed to connect wallet. Please try again."
            setError(errorMessage)
            toast.error("Wallet Connection Failed", { description: errorMessage })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Icons.logo className="mr-2 h-6 w-6" />
                    Sapphire
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Sapphire has revolutionized how we manage our cultural heritage data with decentralized identifiers.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Chen, Digital Archivist</footer>
                    </blockquote>
                </div>
            </div>
            <div className="p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                        <p className="text-sm text-muted-foreground">
                            Connect your wallet to create a decentralized identity
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Wallet Registration</CardTitle>
                            <CardDescription>
                                Connect your wallet to create your decentralized identity
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center space-x-2 rounded-md border p-4">
                                <Icons.wallet className="h-5 w-5" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Wallet-based Authentication
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Your wallet is your identity. No email or password needed.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 rounded-md border p-4">
                                <Icons.info className="h-5 w-5" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        GDPR Compliant
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        By continuing, you agree to our{" "}
                                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                            Privacy Policy
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full" 
                                onClick={handleConnectWallet} 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        Creating DID...
                                    </>
                                ) : (
                                    <>Connect Wallet & Register</>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}