'use client';

import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side providers wrapper for the application
 * Includes authentication, state management, and other providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
