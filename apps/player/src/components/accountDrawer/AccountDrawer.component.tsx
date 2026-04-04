'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMe, useLogout } from '@/lib/auth-hooks';
import { usePlayerProfile } from '@/lib/settings-hooks';
import { useMyCampaigns } from '@/lib/campaign-hooks';
import styles from './AccountDrawer.module.scss';
import { Button } from '@tapestry/ui';
import { FiCompass } from 'react-icons/fi';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AccountDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: profile } = usePlayerProfile(me?.profileRefs?.player);
  const { data: myCampaignsResponse, isLoading: campaignsLoading } = useMyCampaigns();
  const logout = useLogout();

  // Extract campaigns array from API response
  const campaigns = myCampaignsResponse?.payload || [];
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').slice(0, 8);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <aside className={styles.drawer} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.heading}>Account</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.profile}>
          <div className={styles.logoContainer}>
            <Image
              src="https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
              alt="Tapestry Logo"
              width={200}
              height={200}
              className={styles.logo}
            />
            {activeCampaigns.length > 0 && (
              <div className={styles.campaignsSection}>
                <div className={styles.sectionHeader}>My Campaigns</div>
                <nav className={styles.campaignsList}>
                  {activeCampaigns.map((campaign) => (
                    <Link key={campaign._id} className={styles.campaignLink} href={`/games/${campaign._id}/board`} onClick={onClose}>
                      <FiCompass className={styles.campaignIcon} />
                      <span className={styles.campaignName}>{campaign.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {campaignsLoading && (
              <div className={styles.campaignsSection}>
                <div className={styles.sectionHeader}>My Campaigns</div>
                <div className={styles.loading}>Loading campaigns...</div>
              </div>
            )}

            {!campaignsLoading && activeCampaigns.length === 0 && (
              <div className={styles.campaignsSection}>
                <div className={styles.sectionHeader}>My Campaigns</div>
                <div className={styles.emptyCampaigns}>
                  <p>No active campaigns yet.</p>
                  <Link className={styles.browseLink} href="/games" onClick={onClose}>
                    Browse Games
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className={styles.name}>{profile?.displayName ?? 'Adventurer'}</div>
          <div className={styles.email}>{me?.email ?? ''}</div>
        </div>

        <nav className={styles.nav}>
          <Link className={styles.link} href="/settings" onClick={onClose}>
            Settings
          </Link>
        </nav>

        <div className={styles.footer}>
          <Button
            className={styles.logoutBtn}
            onClick={() => {
              logout();
              onClose();
              router.replace('/login');
            }}
          >
            Log out
          </Button>
        </div>
      </aside>
    </div>
  );
}
