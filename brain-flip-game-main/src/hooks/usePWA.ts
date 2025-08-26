/** PWA Management Hook */
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  isStandalone: boolean;
  installPromptEvent: any | null;
}

export interface PWACapabilities {
  canInstall: boolean;
  canUpdate: boolean;
  supportsNotifications: boolean;
  supportsBackgroundSync: boolean;
  supportsOffline: boolean;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    hasUpdate: false,
    isStandalone: false,
    installPromptEvent: null,
  });

  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    canInstall: false,
    canUpdate: false,
    supportsNotifications: false,
    supportsBackgroundSync: false,
    supportsOffline: false,
  });

  // Detect capabilities
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canSW = 'serviceWorker' in navigator;
    setCapabilities({
      canInstall: canSW && 'BeforeInstallPromptEvent' in window,
      canUpdate: canSW,
      supportsNotifications: 'Notification' in window,
      supportsBackgroundSync: canSW && 'sync' in (window as any).ServiceWorkerRegistration.prototype,
      supportsOffline: canSW && 'caches' in window,
    });
  }, []);

  // Standalone mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(display-mode: standalone)');
    const update = () => {
      const isStandalone = mq.matches || (navigator as any).standalone || document.referrer.includes('android-app://');
      setPwaState((s) => ({ ...s, isStandalone }));
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // beforeinstallprompt / appinstalled
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setPwaState((s) => ({ ...s, isInstallable: true, installPromptEvent: e }));
    };
    const handleAppInstalled = () => {
      setPwaState((s) => ({ ...s, isInstalled: true, isInstallable: false, installPromptEvent: null }));
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Online/offline
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setPwaState((s) => ({ ...s, isOffline: !navigator.onLine }));
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  // Service worker update detection (no manual registration here; next-pwa handles it)
  useEffect(() => {
    if (typeof window === 'undefined' || !capabilities.canUpdate) return;
    let unsubMessage: ((this: ServiceWorkerContainer, ev: MessageEvent) => any) | null = null;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;
        const listen = (sw: ServiceWorker | null) => {
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              setPwaState((s) => ({ ...s, hasUpdate: true }));
            }
          });
        };
        reg.addEventListener('updatefound', () => listen(reg.installing || null));
        listen(reg.waiting || null);
        unsubMessage = (e: MessageEvent) => {
          if ((e.data && (e.data.type === 'UPDATE_AVAILABLE' || e.data === 'UPDATE_AVAILABLE'))) {
            setPwaState((s) => ({ ...s, hasUpdate: true }));
          }
        };
        navigator.serviceWorker.addEventListener('message', unsubMessage);
      } catch (e) {
        console.warn('SW update detection failed', e);
      }
    })();
    return () => {
      if (unsubMessage) navigator.serviceWorker.removeEventListener('message', unsubMessage);
    };
  }, [capabilities.canUpdate]);

  const installPWA = useCallback(async (): Promise<boolean> => {
    const ev = pwaState.installPromptEvent;
    if (!ev) {
      console.warn('No install prompt available');
      return false;
    }
    try {
      ev.prompt();
      const choice = await ev.userChoice;
      const accepted = choice && choice.outcome === 'accepted';
      setPwaState((s) => ({ ...s, isInstalled: accepted ? true : s.isInstalled, isInstallable: accepted ? false : s.isInstallable, installPromptEvent: null }));
      return !!accepted;
    } catch (e) {
      console.error('Install failed', e);
      return false;
    }
  }, [pwaState.installPromptEvent]);

  const updatePWA = useCallback(async (): Promise<boolean> => {
    if (!capabilities.canUpdate) return false;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg || !reg.waiting) return false;
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      const onControllerChange = () => window.location.reload();
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange, { once: true } as any);
      return true;
    } catch (e) {
      console.error('Update failed', e);
      return false;
    }
  }, [capabilities.canUpdate]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!capabilities.supportsNotifications) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }, [capabilities.supportsNotifications]);

  const showNotification = useCallback(async (title: string, options?: NotificationOptions): Promise<boolean> => {
    if (!capabilities.supportsNotifications || Notification.permission !== 'granted') return false;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) await reg.showNotification(title, { icon: '/images/icons/icon-192x192.svg', badge: '/images/icons/icon-192x192.svg', ...options });
      else new Notification(title, { icon: '/images/icons/icon-192x192.svg', ...options });
      return true;
    } catch {
      return false;
    }
  }, [capabilities.supportsNotifications]);

  const shouldShowInstallPrompt = useCallback((): boolean => {
    if (!pwaState.isInstallable || pwaState.isInstalled || pwaState.isStandalone) return false;
    const last = localStorage.getItem('pwa-install-dismissed');
    if (last) {
      const days = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
      if (days < 7) return false;
    }
    const gamesPlayed = Number(localStorage.getItem('games-played') || '0');
    return gamesPlayed >= 3;
  }, [pwaState.isInstallable, pwaState.isInstalled, pwaState.isStandalone]);

  const dismissInstallPrompt = useCallback(() => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setPwaState((s) => ({ ...s, isInstallable: false }));
  }, []);

  const getPWAInfo = useCallback(() => ({
    name: 'Brain Flip Game',
    shortName: 'Brain Flip',
    description: 'Challenge your mind with reverse psychology puzzles',
    version: '1.0.0',
    themeColor: '#1e1b4b',
    backgroundColor: '#0f0f23',
  }), []);

  const getCacheStatus = useCallback(async () => {
    if (!capabilities.supportsOffline) return null;
    try {
      const cacheNames = await caches.keys();
      const cachesInfo = await Promise.all(
        cacheNames.map(async (name) => ({ name, size: (await (await caches.open(name)).keys()).length }))
      );
      return { caches: cachesInfo, totalCaches: cacheNames.length, totalCachedItems: cachesInfo.reduce((s, c) => s + c.size, 0) };
    } catch (e) {
      console.error('Cache status failed', e);
      return null;
    }
  }, [capabilities.supportsOffline]);

  const clearCache = useCallback(async () => {
    if (!capabilities.supportsOffline) return false;
    try {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      return true;
    } catch (e) {
      console.error('Clear cache failed', e);
      return false;
    }
  }, [capabilities.supportsOffline]);

  const isOnline = useMemo(() => !pwaState.isOffline, [pwaState.isOffline]);
  const canInstall = useMemo(() => capabilities.canInstall && pwaState.isInstallable, [capabilities.canInstall, pwaState.isInstallable]);
  const needsUpdate = useMemo(() => pwaState.hasUpdate, [pwaState.hasUpdate]);
  const isAppLike = useMemo(() => pwaState.isStandalone || pwaState.isInstalled, [pwaState.isStandalone, pwaState.isInstalled]);

  return {
    pwaState,
    capabilities,
    installPWA,
    shouldShowInstallPrompt,
    dismissInstallPrompt,
    updatePWA,
    requestNotificationPermission,
    showNotification,
    getCacheStatus,
    clearCache,
    getPWAInfo,
    isOnline,
    canInstall,
    needsUpdate,
    isAppLike,
  };
}