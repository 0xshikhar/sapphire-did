'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, ShieldOff, Download, AlertTriangle } from 'lucide-react'
import { GDPRService } from '@/services/gdpr.service'
import { ConsentType, ConsentTypes, ConsentStatus } from '@/config/consent.config'

const consentTypeLabels: Record<ConsentType, { title: string; description: string }> = {
  [ConsentTypes.DATA_LINKING]: {
    title: 'Dataverse Dataset Linking',
    description: 'Allow your DID to be linked with datasets from Dataverse.',
  },
  [ConsentTypes.AI_METADATA_ENHANCEMENT]: {
    title: 'AI Metadata Enhancement',
    description: 'Permit AI services to analyze and enhance metadata for your linked datasets.',
  },
  [ConsentTypes.AI_RECOMMENDATIONS]: {
    title: 'AI-Powered Recommendations',
    description: 'Receive personalized dataset recommendations based on your activity.',
  },
  [ConsentTypes.COMMUNITY_CONTRIBUTIONS]: {
    title: 'Community Contributions',
    description: 'Participate in community features, like suggesting metadata improvements.',
  },
  [ConsentTypes.GENERAL_DATA_PROCESSING]: {
    title: 'General Data Processing',
    description: 'Allow essential data processing required for basic application functionality.',
  },
};

export default function GDPRSettingsPage() {
  const [consentStatus, setConsentStatus] = useState<Record<ConsentType, boolean> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Partial<Record<ConsentType, boolean>>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    toast.info('Starting data export... This may take a moment.');
    try {
      const dataBlob = await GDPRService.exportUserData('');
      const url = window.URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sapphire_user_data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('User data exported successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export user data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to permanently delete your account? This action cannot be undone.'
    );
    if (!confirmation) return;

    setIsDeleting(true);
    toast.info('Processing account deletion...');
    try {
      await GDPRService.deleteAccount('');
      toast.success('Account deleted successfully. You will be logged out.');
      // Here you would typically redirect the user to the logout page
      // window.location.href = '/logout';
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const status = await GDPRService.getConsentStatus('');
        setConsentStatus(status);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load consent settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleConsentChange = async (consentType: ConsentType, isGranted: boolean) => {
    setIsUpdating(prev => ({ ...prev, [consentType]: true }));
    const originalStatus = { ...consentStatus! };

    try {
      // Optimistic UI update
      setConsentStatus(prev => ({ ...prev!, [consentType]: isGranted }));

      await GDPRService.updateConsent('', consentType, isGranted);

      if (isGranted) {
        toast.success(`${consentTypeLabels[consentType].title} consent granted.`);
      } else {
        toast.info(`${consentTypeLabels[consentType].title} consent withdrawn.`);
      }
    } catch (error) {
      // Revert on error
      setConsentStatus(originalStatus);
      toast.error(`Failed to update consent for ${consentTypeLabels[consentType].title}.`);
    } finally {
      setIsUpdating(prev => ({ ...prev, [consentType]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading Consent Settings...</p>
      </div>
    );
  }

  if (!consentStatus) {
    return <p>Could not load settings. Please try again later.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Consent Management</h1>
        <p className="text-muted-foreground">
          Manage your GDPR consent preferences for various platform features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Consents</CardTitle>
          <CardDescription>
            You have the right to withdraw your consent at any time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(consentTypeLabels).map(([key, { title, description }]) => {
            const consentType = key as ConsentType;
            const isGranted = consentStatus[consentType];
            const isProcessing = isUpdating[consentType];

            return (
              <div key={consentType} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold flex items-center">
                    {isGranted ? (
                      <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
                    ) : (
                      <ShieldOff className="h-5 w-5 mr-2 text-red-600" />
                    )}
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
                <div className="flex items-center">
                  {isProcessing && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                  <Switch
                    checked={isGranted}
                    onCheckedChange={(checked) => handleConsentChange(consentType, checked)}
                    disabled={isProcessing}
                    aria-label={`Toggle consent for ${title}`}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Portability & Erasure</CardTitle>
          <CardDescription>
            Request an export of your data or its permanent deletion.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export My Data
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            Delete My Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
