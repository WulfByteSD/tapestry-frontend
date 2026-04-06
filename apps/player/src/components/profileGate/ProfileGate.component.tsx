'use client';

import { ReactNode } from 'react';
import { usePlayerProfile } from '@tapestry/hooks';
import { alertManager, Loader } from '@tapestry/ui';
import { api } from '@/lib/api';
import { useMe } from '@/lib/auth-hooks';
import styles from './ProfileGate.module.scss';

export default function ProfileGate({ children }: { children: ReactNode }) {
  const { data: user, isLoading: userLoading } = useMe();
  const { selectedProfile, isLoading: profileLoading, isError } = usePlayerProfile(api, user);

  // Show loading state while checking authentication and profile
  if (userLoading || profileLoading) {
    return (
      <div className={styles.state}>
        <Loader size="lg" tone="gold" label="Loading your profile..." />
      </div>
    );
  }

  // If no profile exists or error fetching profile, show create profile screen
  if (!selectedProfile || isError) {
    return (
      <div className={styles.createProfileContainer}>
        <div className={styles.createProfileCard}>
          <h1>Welcome to Tapestry!</h1>
          <p>You need to create a player profile to get started.</p>
          <button
            className={styles.createButton}
            onClick={() => {
              alertManager.addAlert('Create profile form will be implemented here', 'info');
              // TODO: Navigate to profile creation flow or show modal
            }}
          >
            Create Player Profile
          </button>
        </div>
      </div>
    );
  }

  // Profile exists, render the portal content
  return <>{children}</>;
}
