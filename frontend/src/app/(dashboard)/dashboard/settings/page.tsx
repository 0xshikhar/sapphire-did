'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { Shield, User, Bell, Key, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Define settings categories
const settingsCategories = [
    {
        id: 'gdpr',
        title: 'GDPR & Privacy',
        description: 'Manage your data privacy rights and GDPR compliance settings',
        icon: <Shield className="h-5 w-5" />,
        href: '/dashboard/settings/gdpr',
    },
    {
        id: 'consent',
        title: 'Consent Management',
        description: 'Control how your data is used across the platform',
        icon: <Shield className="h-5 w-5" />,
        href: '/dashboard/consent',
    },
    {
        id: 'profile',
        title: 'Profile Settings',
        description: 'Update your profile information and preferences',
        icon: <User className="h-5 w-5" />,
        href: '/dashboard/settings/profile',
    },
    {
        id: 'notifications',
        title: 'Notification Settings',
        description: 'Configure your notification preferences',
        icon: <Bell className="h-5 w-5" />,
        href: '/dashboard/settings/notifications',
    },
    {
        id: 'security',
        title: 'Security',
        description: 'Manage wallet connections and security settings',
        icon: <Key className="h-5 w-5" />,
        href: '/dashboard/settings/security',
    }
]

export default function SettingsPage() {
    const { authenticated, ready, user } = usePrivy()
    const router = useRouter()

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/login')
        }
    }, [authenticated, ready, router])

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Settings"
                description="Manage your account settings and preferences"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settingsCategories.map(category => (
                    <Card key={category.id} className="flex flex-col">
                        <CardHeader className="flex-1">
                            <div className="flex items-center gap-2 mb-2 text-primary">
                                {category.icon}
                                <CardTitle>{category.title}</CardTitle>
                            </div>
                            <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="outline" asChild className="w-full">
                                <Link href={category.href} className="flex items-center justify-center gap-2">
                                    Manage
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">About Your Data</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Data Control & Privacy</CardTitle>
                        <CardDescription>
                            Sapphire is built on decentralized identity principles, giving you full control over your data.
                            Our implementation follows GDPR compliance and W3C DID standards.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/consent">Manage Consents</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/gdpr-consent">Privacy Policy</Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </DashboardShell>
    )
}
