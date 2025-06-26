"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { UserAccountNav } from "@/components/user-account-nav"
import { useAccount } from "wagmi"

export function SiteHeader() {
    const pathname = usePathname()
    const { address, isConnected } = useAccount()

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between gap-4 sm:space-x-0">
                <MainNav items={siteConfig.mainNav} />
                {address && isConnected ? (
                    <div className="flex items-center gap-4">
                        <UserAccountNav />
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-1">
                            <Link
                                href="/register"
                                className={cn(
                                    buttonVariants({ variant: "default", size: "sm" }),
                                    "px-4"
                                )}
                            >
                                Login
                            </Link>
                        </nav>
                    </div>
                )}
                <ModeToggle />
            </div>
        </header>
    )
}
