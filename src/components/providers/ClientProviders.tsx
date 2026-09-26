'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { PwaProvider } from '@/context/PwaContext';
import SignOutConfirmModal from '@/components/auth/SignOutConfirmModal';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <PwaProvider>
        {children}
        <SignOutConfirmModal />
      </PwaProvider>
    </AppProvider>
  );
}
