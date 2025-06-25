"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { PrivyProvider } from '@privy-io/react-auth';
// Make sure to import these from `@privy-io/wagmi`, not `wagmi`
import { WagmiProvider, createConfig } from '@privy-io/wagmi';

import { privyConfig } from '@/config/privyConfig';
import { config } from '@/config/wagmiConfig';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''} config={privyConfig}>
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={config}>{children}</WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}