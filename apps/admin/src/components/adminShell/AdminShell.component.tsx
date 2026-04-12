'use client';

import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BiCog, BiFile, BiHome, BiLibrary, BiShoppingBag, BiTable, BiUser } from 'react-icons/bi';
import { useAdminProfile } from '@tapestry/hooks';
import { AlertContainer, Header, Loader, Sidebar, type SidebarGroup } from '@tapestry/ui';
import { api } from '@/lib/api';
import { useLogout, useMe } from '@/lib/auth-hooks';
import styles from './AdminShell.module.scss';
import Image from 'next/image';

const sidebarGroups: SidebarGroup[] = [
  {
    title: 'Main',
    links: [{ href: '/', label: 'Dashboard', icon: <BiHome /> }],
  },
  {
    title: 'Gameplay',
    links: [
      {
        href: '/content',
        label: 'Content',
        icon: <BiLibrary />,
        children: [
          {
            href: '/content/items',
            label: 'Items',
            icon: <>A</>,
          },
          {
            href: '/content/abilities',
            label: 'Abilities',
            icon: <>B</>,
          },
          {
            href: '/content/skills',
            label: 'Skills',
            icon: <>S</>,
          },
        ],
      },
      { href: '/products', label: 'Products', icon: <BiShoppingBag /> },
      { href: '/tables', label: 'Tables', icon: <BiTable /> },
      { href: '/settings-admin', label: 'Settings', icon: <BiFile /> },
    ],
  },
  {
    title: 'Platform',
    links: [{ href: '/players', label: 'Players', icon: <BiUser /> }],
  },
  {
    title: 'Account',
    links: [{ href: '/settings', label: 'Settings', icon: <BiCog /> }],
  },
];

function LoadingState({ message }: { message: string }) {
  return (
    <div className={styles.stateWrap}>
      <div className={styles.stateCard}>
        <Loader caption={message} />
      </div>
    </div>
  );
}

function getDisplayName(profile: any, email?: string | null) {
  if (typeof profile?.displayName === 'string' && profile.displayName.trim()) {
    return profile.displayName;
  }

  const firstName = typeof profile?.firstName === 'string' ? profile.firstName.trim() : '';
  const lastName = typeof profile?.lastName === 'string' ? profile.lastName.trim() : '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  if (fullName) {
    return fullName;
  }

  return email || 'Admin';
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const logout = useLogout();
  const hasRedirectedRef = useRef(false);

  const { data: user, isLoading: userLoading, isError: userError } = useMe();
  const adminProfileId = user?.profileRefs?.admin ?? null;
  const {
    selectedProfile: adminProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = useAdminProfile(api, user, {
    enabled: !!adminProfileId,
    retry: false,
  });

  const nextTarget = useMemo(() => {
    const query = searchParams.toString();
    if (!pathname) return '/';
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const redirectToLogin = useCallback(() => {
    if (hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;
    logout();
    router.replace(`/login?next=${encodeURIComponent(nextTarget)}`);
  }, [logout, nextTarget, router]);

  useEffect(() => {
    if (userLoading) {
      return;
    }

    if (!user || userError) {
      redirectToLogin();
    }
  }, [redirectToLogin, user, userError, userLoading]);

  useEffect(() => {
    if (userLoading || !user) {
      return;
    }

    if (!adminProfileId || profileError) {
      redirectToLogin();
    }
  }, [adminProfileId, profileError, redirectToLogin, user, userLoading]);

  if (userLoading || (!!user && !!adminProfileId && profileLoading)) {
    return <LoadingState message="Loading your admin workspace..." />;
  }

  if (!user || userError || !adminProfileId || profileError || !adminProfile) {
    return <LoadingState message="Redirecting to the admin login..." />;
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebarArea}>
        <Sidebar
          title="Tapestry Admin"
          groups={sidebarGroups}
          currentPath={pathname || '/'}
          LinkComponent={Link}
          logo={
            <Image
              src="https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
              alt="Tapestry Logo"
              width={75}
              height={75}
            />
          }
          footer={
            <div className={styles.footerCopy}>
              <p className={styles.footerTitle}>Storyweaver Console</p>
              <p className={styles.footerVersion}>Admin foundation v{process.env.NEXT_PUBLIC_VERSION}</p>
            </div>
          }
          collapsible={false}
        />
      </aside>

      <div className={styles.contentArea}>
        <Header
          user={{
            fullName: getDisplayName(adminProfile, user?.email),
            profileImageUrl:
              typeof adminProfile?.avatar === 'string' ? adminProfile.avatar : typeof adminProfile?.profileImageUrl === 'string' ? adminProfile.profileImageUrl : null,
          }}
          onLogout={logout}
          showMenuToggle={false}
          className={styles.header}
          leftContent={
            <div className={styles.headerCopy}>
              <p className={styles.headerTitle}>Admin Panel</p>
              <p className={styles.headerSubtitle}>Authenticated storyweaver workspace</p>
            </div>
          }
        />

        <main className={styles.main}>
          <AlertContainer position="top-right" />
          {children}
          <div className={styles.watermark} />
        </main>
      </div>
    </div>
  );
}
