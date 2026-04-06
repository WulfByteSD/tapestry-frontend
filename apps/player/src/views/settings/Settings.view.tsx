'use client';

import { useMe } from '@/lib/auth-hooks';
import { Loader } from '@tapestry/ui';
import ProfileDetailsSection from './ProfileDetailsSection.component';
import styles from './AccountDetails.module.scss';
import PasswordSection from './PasswordSection.component';
import AccountSection from './AccountSection.component';
import NotificationPreferencesSection from './NotificationPreferencesSection.component';
import AppSection from './AppSection.component';

export default function Settings() {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Loader size="lg" tone="gold" label="Loading settings…" />
      </div>
    );
  }

  if (!me) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.contentContainer}>
        <ProfileDetailsSection profileId={me.profileRefs?.player as string | null} />
        <AccountSection userId={me._id} email={me.email} />
        <PasswordSection userId={me._id} />
        <NotificationPreferencesSection userId={me._id} notificationSettings={me.notificationSettings} />
        <AppSection />
      </div>
    </div>
  );
}
