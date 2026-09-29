'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { PwaProvider } from '@/context/PwaContext';
import SignOutConfirmModal from '@/components/auth/SignOutConfirmModal';
import InstallAppModal from '@/components/common/InstallAppModal';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <PwaProvider>
        {children}
        <SignOutConfirmModal />
        <InstallAppModal />
      </PwaProvider>
    </AppProvider>
  );
}
