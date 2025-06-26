"use client"
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';

export function AuthButton() {
    const { login, logout, authenticated, ready, user } = usePrivy();
    const [error, setError] = useState<string>();
    
    // Get the wallet address from Privy user
    const address = user?.wallet?.address;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Connect wallet button */}
            {!authenticated ? (
                <Button 
                    onClick={() => login()}
                    className="gap-2"
                >
                    Connect Wallet
                </Button>
            ) : null}

            {/* Show user info and sign out when authenticated */}
            {authenticated && user && (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-md">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {user.wallet?.address ? 
                                `${user.wallet.address.substring(0, 6)}...${user.wallet.address.substring(user.wallet.address.length - 4)}` : 
                                'Connected User'}
                        </span>
                    </div>
                    
                    <Button 
                        variant="destructive" 
                        onClick={() => logout()}
                        size="sm"
                    >
                        Sign Out
                    </Button>
                </div>
            )}

            {/* Error display */}
            {error && <p className="text-destructive w-full mt-2 text-sm">{error}</p>}
        </div>
    );
}
