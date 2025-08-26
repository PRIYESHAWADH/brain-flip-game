"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';
import { useAnimation } from '@/hooks/useAnimation';
import Button from './ui/Button';
import Card from './ui/Card';

export interface PWAPromptProps {
  className?: string;
  position?: 'top' | 'bottom' | 'center';
  autoShow?: boolean;
  showDelay?: number;
}

export default function PWAPrompt({ className, position = 'bottom', autoShow = true, showDelay = 3000 }: PWAPromptProps) {
  const { shouldShowInstallPrompt, installPWA, dismissInstallPrompt, getPWAInfo, capabilities } = usePWA();
  const pwaInfo = getPWAInfo();
  const { getMotionAnimation } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);

  useEffect(() => {
    if (!autoShow) return;
    const timer = window.setTimeout(() => {
      if (shouldShowInstallPrompt()) setIsVisible(true);
    }, Math.max(0, showDelay || 0));
    return () => window.clearTimeout(timer);
  }, [autoShow, showDelay, shouldShowInstallPrompt]);

  const handleInstall = useCallback(async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      if (success) setIsVisible(false);
    } catch (e) {
      console.error('Installation failed:', e);
    } finally {
      setIsInstalling(false);
    }
  }, [installPWA]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    dismissInstallPrompt();
  }, [dismissInstallPrompt]);

  const handleLearnMore = useCallback(() => setShowBenefits((v) => !v), []);

  if (!capabilities.canInstall || !isVisible) return null;

  const positionClasses: Record<NonNullable<PWAPromptProps['position']>, string> = {
    top: 'top-4 left-4 right-4',
    bottom: 'bottom-4 left-4 right-4',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed ${positionClasses[position]} z-50 max-w-md mx-auto ${className || ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Install app"
        initial={{ opacity: 0, y: position === 'top' ? -20 : position === 'bottom' ? 20 : 0, scale: position === 'center' ? 0.9 : 1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: position === 'top' ? -20 : position === 'bottom' ? 20 : 0, scale: position === 'center' ? 0.9 : 1 }}
        transition={getMotionAnimation('ui', 'slideUp')}
      >
        <Card variant="glass" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] opacity-10" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-[var(--color-text-primary)]">Install {pwaInfo.shortName}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Get the full app experience</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]" aria-label="Dismiss installation prompt">✕</Button>
            </div>

            <AnimatePresence>
              {showBenefits && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={getMotionAnimation('ui', 'fadeIn')} className="mb-4 p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-primary)]" id="pwa-benefits">
                  <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">Why install?</h4>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                    <li className="flex items-center space-x-2"><span className="text-[var(--color-success)]">✓</span><span>Play offline without internet</span></li>
                    <li className="flex items-center space-x-2"><span className="text-[var(--color-success)]">✓</span><span>Faster loading and better performance</span></li>
                    <li className="flex items-center space-x-2"><span className="text-[var(--color-success)]">✓</span><span>Native app experience</span></li>
                    <li className="flex items-center space-x-2"><span className="text-[var(--color-success)]">✓</span><span>No app store required</span></li>
                    <li className="flex items-center space-x-2"><span className="text-[var(--color-success)]">✓</span><span>Automatic updates</span></li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-x-3">
              <Button variant="ghost" size="sm" onClick={handleLearnMore} className="text-[var(--color-text-secondary)]" aria-expanded={showBenefits} aria-controls="pwa-benefits">
                {showBenefits ? 'Show Less' : 'Learn More'}
              </Button>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm" onClick={handleDismiss}>Not Now</Button>
                <Button variant="primary" size="sm" onClick={handleInstall} loading={isInstalling} disabled={isInstalling}>{isInstalling ? 'Installing...' : 'Install'}</Button>
              </div>
            </div>

            <div className="mt-3 text-xs text-[var(--color-text-tertiary)] text-center">Free • No registration required • Works offline</div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export function PWAUpdateNotification() {
  const { needsUpdate, updatePWA } = usePWA();
  const { getMotionAnimation } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => setIsVisible(needsUpdate), [needsUpdate]);

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true);
    try { await updatePWA(); } catch (e) { console.error('Update failed:', e); }
    setIsUpdating(false);
  }, [updatePWA]);

  const handleDismiss = useCallback(() => setIsVisible(false), []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed top-4 right-4 z-50 max-w-sm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={getMotionAnimation('ui', 'slideUp')}>
        <Card variant="glass" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-success)] to-[var(--color-primary)] opacity-10" />
          <div className="relative p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔄</span>
                <div>
                  <h4 className="font-semibold text-[var(--color-text-primary)]">Update Available</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">New features and improvements</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-[var(--color-text-tertiary)]" aria-label="Dismiss update notification">✕</Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" onClick={handleDismiss}>Later</Button>
              <Button variant="primary" size="sm" onClick={handleUpdate} loading={isUpdating} disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Update Now'}</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const { getMotionAnimation } = useAnimation();
  if (isOnline) return null;
  return (
    <motion.div className="fixed top-4 left-4 z-50" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={getMotionAnimation('ui', 'slideUp')}>
      <div className="px-3 py-2 rounded-lg bg-[var(--color-warning)] text-[var(--color-warning-text)] text-sm font-medium flex items-center space-x-2">
        <span>📡</span>
        <span>Playing Offline</span>
      </div>
    </motion.div>
  );
}