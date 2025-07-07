"use client"

// This file is kept as a compatibility layer but doesn't provide any functionality
// All authentication is now handled directly through Privy

import { ReactNode } from 'react'

// Provider component that just passes through children
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// This hook is maintained for backward compatibility but should not be used
// Use usePrivy from '@privy-io/react-auth' directly instead
export const useAuthContext = () => {
  console.warn('useAuthContext is deprecated. Use usePrivy from @privy-io/react-auth directly instead.')
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: () => Promise.resolve(),
    logout: () => {}
  }
}
