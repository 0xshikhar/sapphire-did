"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"

import { dashboardConfig } from "@/config/dashboard"
// import { MainNav } from "@/components/main-nav"
import { DashboardNav } from "@/components/nav/dashboard-nav"
// import { SiteFooter } from "@/components/site-footer"
// import { UserAccountNav } from "@/components/user-account-nav"
// import { ModeToggle } from "@/components/mode-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { authenticated, ready } = usePrivy()
  const router = useRouter()
  
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login")
    }
  }, [authenticated, ready, router])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden pt-5 w-[200px] flex-col md:flex">
          <DashboardNav items={dashboardConfig.sidebarNav} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden pt-5">
          {children}
        </main>
      </div>
    </div>
  )
}