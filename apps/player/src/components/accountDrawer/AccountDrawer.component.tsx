'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMe, useLogout } from '@/lib/auth-hooks';
import { usePlayerProfile } from '@/lib/settings-hooks';
import { useMyCampaigns } from '@/lib/campaign-hooks';
import { getNavigationLinks } from '@/data/sidebarLinks';
import styles from './AccountDrawer.module.scss';
import { Button, Loader } from '@tapestry/ui';
import type { SidebarLink } from '@tapestry/ui';

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
  const navGroups = getNavigationLinks({ profile, campaigns });

  // Filter groups to only show those with mobile-hidden links
  const drawerGroups = navGroups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => link.hideOnMobile),
    }))
    .filter((group) => group.links.length > 0);

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
          </div>
          <div className={styles.name}>{profile?.displayName ?? 'Adventurer'}</div>
          <div className={styles.email}>{me?.email ?? ''}</div>
        </div>

        <nav className={styles.nav}>
          {campaignsLoading && (
            <div className={styles.loadingState}>
              <Loader size="sm" tone="gold" label="Loading navigation..." />
            </div>
          )}

          {!campaignsLoading &&
            drawerGroups.map((group) => (
              <div key={group.title} className={styles.navGroup}>
                <div className={styles.groupTitle}>{group.title}</div>
                <div className={styles.groupLinks}>
                  {group.links.map((link) => (
                    <Link key={link.href} className={styles.link} href={link.href} onClick={onClose}>
                      {link.icon && <span className={styles.linkIcon}>{link.icon}</span>}
                      <span className={styles.linkLabel}>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
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
