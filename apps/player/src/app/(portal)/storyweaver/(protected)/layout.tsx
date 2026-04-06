'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/lib/auth-hooks';
import { usePlayerProfile } from '@/lib/settings-hooks';
import { Loader } from '@tapestry/ui';

export default function ProtectedStoryweaverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useMe();
  const playerId = me?.profileRefs?.player as string | undefined;
  const { data: profile, isLoading: profileLoading } = usePlayerProfile(playerId);

  useEffect(() => {
    if (meLoading || profileLoading) return;

    const roles = profile?.roles || [];
    if (!roles.includes('storyweaver')) {
      router.replace('/storyweaver/become');
    }
  }, [meLoading, profileLoading, profile, router]);

  if (meLoading || profileLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader size="lg" tone="gold" label="Loading Storyweaver tools…" />
      </div>
    );
  }

  const roles = profile?.roles || [];
  if (!roles.includes('storyweaver')) {
    return null;
  }

  return <>{children}</>;
}
