"use client"

import { Metadata } from "next"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { DatasetList } from "@/components/datasets/dataset-list"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"

// Metadata needs to be in a separate file for client components
// This will be moved to a separate file

export default function DashboardPage() {
    const { authenticated, ready, user } = usePrivy()
    const router = useRouter()

    useEffect(() => {
        if (ready && !authenticated) {
            router.push("/login")
        }
    }, [authenticated, ready, router])

    return (
        <div className="pt-5">
            <DashboardShell>
                <DashboardHeader
                    heading="Dashboard"
                    description="Welcome to your Sapphire dashboard."
                />
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="flex flex-col gap-6">
                        <StatsCards />
                        <div className="rounded-lg border p-6">
                            <h3 className="mb-4 text-lg font-medium">Your DIDs</h3>
                            <p className="text-sm text-muted-foreground">
                                Your decentralized identifiers provide secure, verifiable digital identity.
                            </p>
                            <div className="mt-4">
                                <div className="rounded-md bg-secondary/50 p-4">
                                    <p className="font-mono text-xs break-all">{authenticated && user?.wallet?.address ? `did:ethr:${user?.wallet?.address}` : 'Not connected'}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">Primary Identity DID</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <RecentActivity />
                        <div>
                            <h3 className="mb-4 text-lg font-medium">Recent Datasets</h3>
                            <DatasetList datasets={[]} isLoading={false} error={null} onUnlink={() => {}} limit={3} />
                        </div>
                    </div>
                </div>
            </DashboardShell>
        </div>
    )
}