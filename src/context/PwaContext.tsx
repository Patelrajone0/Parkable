'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (open: boolean) => void;
  promptInstall: () => Promise<boolean>;
  openInstallGuide: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isInstallModalOpen: false,
  setIsInstallModalOpen: () => {},
  promptInstall: async () => false,
  openInstallGuide: () => {},
});

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Check if already installed in standalone mode
      const checkInstalled = () => {
        const isStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          window.matchMedia('(display-mode: window-controls-overlay)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        setIsInstalled(isStandalone);
      };

      checkInstalled();

      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const handleMediaChange = (e: MediaQueryListEvent) => {
        setIsInstalled(e.matches);
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaChange);
      }

      // 2. Register Service Worker with robust scope handling
      const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
          const swUrl = `${basePath}/sw.js`;
          navigator.serviceWorker
            .register(swUrl, { scope: `${basePath}/` })
            .then((reg) => {
              console.log('Parkable PWA Service Worker active:', reg.scope);
            })
            .catch((err) => {
              console.warn('Parkable Service Worker registration note:', err);
            });
        }
      };

      if ('serviceWorker' in navigator) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          registerServiceWorker();
        } else {
          window.addEventListener('load', registerServiceWorker);
        }
      }

      // 3. Capture beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent default mini-infobar on mobile so our custom triggers work smoothly
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMediaChange);
        }
      };
    }
  }, []);

  const openInstallGuide = () => {
    setIsInstallModalOpen(true);
  };

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      // If native deferred prompt is not ready or supported, open the visual install guide
      setIsInstallModalOpen(true);
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error showing PWA install prompt:', err);
      setIsInstallModalOpen(true);
      return false;
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable: !!deferredPrompt && !isInstalled,
        isInstalled,
        isInstallModalOpen,
        setIsInstallModalOpen,
        promptInstall,
        openInstallGuide,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = () => useContext(PwaContext);
