'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { Loader2, ShieldCheck, ShieldOff, Info, Database } from 'lucide-react'
import { toast } from 'sonner'
import { ConsentType, ConsentTypes, ConsentStatus } from '@/config/consent.config'
import { GDPRService } from '@/services/gdpr.service'

// Define consent type labels
const consentTypeLabels: Record<ConsentType, { title: string; description: string; icon: React.ReactNode }> = {
    [ConsentTypes.DATA_LINKING]: {
        title: 'Dataverse Dataset Linking',
        description: 'Allow your DID to be linked with datasets from Dataverse.',
        icon: <Database className="h-5 w-5" />,
    },
    [ConsentTypes.AI_METADATA_ENHANCEMENT]: {
        title: 'AI Metadata Enhancement',
        description: 'Permit AI services to analyze and enhance metadata for your linked datasets.',
        icon: <Info className="h-5 w-5" />,
    },
    [ConsentTypes.AI_RECOMMENDATIONS]: {
        title: 'AI-Powered Recommendations',
        description: 'Receive personalized dataset recommendations based on your activity.',
        icon: <Info className="h-5 w-5" />,
    },
    [ConsentTypes.COMMUNITY_CONTRIBUTIONS]: {
        title: 'Community Contributions',
        description: 'Participate in community features, like suggesting metadata improvements.',
        icon: <Info className="h-5 w-5" />,
    },
    [ConsentTypes.GENERAL_DATA_PROCESSING]: {
        title: 'General Data Processing',
        description: 'Allow essential data processing required for basic application functionality.',
        icon: <Info className="h-5 w-5" />,
    },
};

export default function ConsentManagementPage() {
      const { authenticated, ready, user, getAccessToken } = usePrivy()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('current')
    const [consentStatus, setConsentStatus] = useState<Record<ConsentType, boolean> | null>(null)
    const [consentHistory, setConsentHistory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState<Partial<Record<ConsentType, boolean>>>({})

    const fetchConsentData = useCallback(async () => {
        try {
            setIsLoading(true)
            const token = await getAccessToken()
            if (!token) {
                toast.error('Authentication failed. Please log in again.')
                setIsLoading(false)
                return
            }
            // Fetch current consent status
            const status = await GDPRService.getConsentStatus(token)
            setConsentStatus(status)

            // Fetch consent history if available
            try {
                const history = await GDPRService.getConsentHistory(token)
                setConsentHistory(history || [])
            } catch (error) {
                console.error('Failed to load consent history:', error)
                setConsentHistory([])
            }
        } catch (error) {
            console.error('Failed to load consent data:', error)
            toast.error('Failed to load consent settings.')
        } finally {
            setIsLoading(false)
        }
    }, [getAccessToken])

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/login')
        } else if (authenticated) {
            fetchConsentData()
        }
    }, [authenticated, ready, router, fetchConsentData])

    const handleConsentChange = async (consentType: ConsentType, isGranted: boolean) => {
        setIsUpdating(prev => ({ ...prev, [consentType]: true }))
        const originalStatus = { ...consentStatus! }

        try {
            const token = await getAccessToken()
            if (!token) {
                toast.error('Authentication failed. Please log in again.')
                setIsUpdating(prev => ({ ...prev, [consentType]: false }))
                return
            }
            // Optimistic UI update
            setConsentStatus(prev => ({ ...prev!, [consentType]: isGranted }))

            await GDPRService.updateConsent(token, consentType, isGranted)

            if (isGranted) {
                toast.success(`${consentTypeLabels[consentType].title} consent granted.`)
            } else {
                toast.info(`${consentTypeLabels[consentType].title} consent withdrawn.`)
            }

            // Refresh consent history after update
            try {
                const history = await GDPRService.getConsentHistory(token)
                setConsentHistory(history || [])
            } catch (error) {
                console.error('Failed to update consent history:', error)
            }
        } catch (error) {
            // Revert on error
            setConsentStatus(originalStatus)
            toast.error(`Failed to update consent for ${consentTypeLabels[consentType].title}.`)
        } finally {
            setIsUpdating(prev => ({ ...prev, [consentType]: false }))
        }
    }

    if (isLoading) {
        return (
            <DashboardShell>
                <DashboardHeader
                    heading="Consent Management"
                    description="Manage your data consent preferences"
                />
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading Consent Settings...</p>
                </div>
            </DashboardShell>
        )
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Consent Management"
                description="Manage how your data is used and processed according to GDPR regulations"
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="current">Current Consents</TabsTrigger>
                    <TabsTrigger value="history">Consent History</TabsTrigger>
                </TabsList>

                <TabsContent value="current" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Consent Preferences</CardTitle>
                            <CardDescription>
                                Control how your data is used across Sapphire&apos;s features and integrations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {consentStatus ? (
                                Object.entries(consentTypeLabels).map(([key, { title, description, icon }]) => {
                                    const consentType = key as ConsentType
                                    const isGranted = consentStatus[consentType]
                                    const isProcessing = isUpdating[consentType]

                                    return (
                                        <div key={consentType} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    {icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold flex items-center">
                                                        {isGranted ? (
                                                            <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                                                        ) : (
                                                            <ShieldOff className="h-4 w-4 mr-2 text-red-600" />
                                                        )}
                                                        {title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                <Switch
                                                    checked={isGranted}
                                                    onCheckedChange={(checked) => handleConsentChange(consentType, checked)}
                                                    disabled={isProcessing}
                                                    aria-label={`Toggle consent for ${title}`}
                                                />
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-muted-foreground">Could not load consent settings. Please try again later.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Need Help?</CardTitle>
                            <CardDescription>
                                Learn more about how we manage your data and protect your privacy
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button variant="outline" onClick={() => router.push('/gdpr-consent')}>
                                    Privacy Policy
                                </Button>
                                <Button variant="outline" onClick={() => router.push('/dashboard/settings/gdpr')}>
                                    Advanced GDPR Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Consent History</CardTitle>
                            <CardDescription>
                                A record of changes to your consent settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {consentHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {consentHistory.map((record, index) => (
                                        <div key={index} className="border-b pb-4 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">
                                                        {record.consentType in consentTypeLabels
                                                            ? consentTypeLabels[record.consentType as ConsentType].title
                                                            : record.consentType}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {record.action === 'grant' ? 'Consent granted' : 'Consent withdrawn'}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(record.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No consent history available.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardShell>
    )
}
