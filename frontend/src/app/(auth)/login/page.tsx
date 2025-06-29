"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Simulating Privy authentication since we don't have the actual package installed
  const handleWalletLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store authentication state in localStorage (this would be handled by Privy in production)
      localStorage.setItem("sapphire_auth", JSON.stringify({
        authenticated: true,
        wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        timestamp: Date.now()
      }));
      
      // Redirect to dashboard using replace to prevent back navigation to login
      router.replace("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const authData = localStorage.getItem("sapphire_auth");
      if (authData) {
        try {
          const { authenticated, timestamp } = JSON.parse(authData);
          const isValid = authenticated && (Date.now() - timestamp < 24 * 60 * 60 * 1000); // 24 hours
          
          if (isValid) {
            // Use replace instead of push to prevent back button from returning to login
            router.replace("/dashboard");
          }
        } catch (e) {
          // Invalid auth data, clear it
          localStorage.removeItem("sapphire_auth");
        }
      }
    };
    
    checkAuth();
  }, [router]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-10 w-10" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Sapphire</h1>
          <p className="text-sm text-muted-foreground">
            Decentralized Identity Management for Cultural Heritage Data
          </p>
        </div>
        
        <div className="grid gap-6">
          <Button 
            onClick={handleWalletLogin} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Icons.wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleWalletLogin} 
            variant="outline" 
            className="w-full"
            disabled={isLoading}
          >
            <Icons.mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              By connecting, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}