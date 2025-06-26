import Link from "next/link"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";

export function UserAccountNav() {
  const { user, authenticated, login, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const wallet = useWallet();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout with loading state
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user's wallet address
  const walletAddress = wallet?.address || user?.wallet?.address || "";

  // Format address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get user avatar image (Privy doesn't provide avatarUrl directly)

  // If Privy is not ready yet, show loading state
  if (!ready) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {/* <Icons.user className="mr-2 h-4 w-4" /> */}
          <Icons.spinner className="h-4 w-4 animate-spin" />
        </AvatarFallback>
      </Avatar>
    );
  }

  // If not authenticated, show login button
  if (!authenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => login()}
        className="flex items-center gap-2"
      >
        <Icons.wallet className="h-4 w-4" />
        Try Now
      </Button>
    );
  }

  // If authenticated, show user dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8 bg-blue-200">
          <AvatarImage src="" alt={walletAddress} />
          <AvatarFallback>
            <Icons.user className="  h-5 w-5" />
            {/* {walletAddress ? walletAddress.charAt(2).toUpperCase() : "U"} */}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {formatAddress(walletAddress) || "User"}
            </p>
            {walletAddress && (
              <p className="text-xs leading-none text-muted-foreground">
                {formatAddress(walletAddress)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <Icons.dashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Icons.settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/dids">
              <Icons.fingerprint className="mr-2 h-4 w-4" />
              <span>My DIDs</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer"
        >
          {isLoggingOut ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.lock className="mr-2 h-4 w-4" />
          )}
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
