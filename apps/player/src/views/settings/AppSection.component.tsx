'use client';

import { useState } from 'react';
import { Button } from '@tapestry/ui';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import styles from './AccountDetails.module.scss';

export default function AppSection() {
  const { canInstall, isInstalled, isLoading, install } = usePwaInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await install();
    } catch (error) {
      console.error('Failed to install app:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>App Installation</h2>
          <p className={styles.sectionSubtitle}>Install Tapestry as a standalone app on your device.</p>
        </div>
      </div>

      <div className={styles.formStack}>
        {isLoading && <p className={styles.muted}>Checking if app installation is available...</p>}

        {!isLoading && isInstalled && (
          <div className={styles.installStatus}>
            <p className={styles.successMessage}>✓ Tapestry is already installed on this device</p>
            <p className={styles.muted}>You can access it from your home screen or app drawer.</p>
          </div>
        )}

        {!isLoading && canInstall && (
          <div className={styles.installPrompt}>
            <p>Install Tapestry to get a native app experience with faster access, offline support, and notifications.</p>
            <div className={styles.actionsRow}>
              <Button onClick={handleInstall} disabled={isInstalling} tone="gold">
                {isInstalling ? 'Installing...' : 'Install App'}
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !canInstall && !isInstalled && (
          <p className={styles.muted}>App installation is not available on this browser. Try using Chrome, Edge, or Safari on a supported device.</p>
        )}
      </div>
    </section>
  );
}
