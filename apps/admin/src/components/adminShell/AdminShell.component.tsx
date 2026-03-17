"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BiCog, BiHome, BiLibrary, BiShoppingBag, BiTable } from "react-icons/bi";
import { useAdminProfile } from "@tapestry/hooks";
import { AlertContainer, Header, Sidebar, type SidebarGroup } from "@tapestry/ui";
import { api } from "@/lib/api";
import { useLogout, useMe } from "@/lib/auth-hooks";
import styles from "./AdminShell.module.scss";

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Main",
    links: [{ href: "/", label: "Dashboard", icon: <BiHome /> }],
  },
  {
    title: "Gameplay",
    links: [
      { href: "/content", label: "Content", icon: <BiLibrary /> },
      { href: "/products", label: "Products", icon: <BiShoppingBag /> },
      { href: "/tables", label: "Tables", icon: <BiTable /> },
    ],
  },
  {
    title: "Account",
    links: [{ href: "/settings", label: "Settings", icon: <BiCog /> }],
  },
];

function LoadingState({ message }: { message: string }) {
  return (
    <div className={styles.stateWrap}>
      <div className={styles.stateCard}>
        <div className={styles.spinner} />
        <div className={styles.stateCopy}>
          <p className={styles.stateTitle}>Tapestry Admin</p>
          <p className={styles.stateMessage}>{message}</p>
        </div>
      </div>
    </div>
  );
}

function getDisplayName(profile: any, email?: string | null) {
  if (typeof profile?.displayName === "string" && profile.displayName.trim()) {
    return profile.displayName;
  }

  const firstName = typeof profile?.firstName === "string" ? profile.firstName.trim() : "";
  const lastName = typeof profile?.lastName === "string" ? profile.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (fullName) {
    return fullName;
  }

  return email || "Admin";
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
    if (!pathname) return "/";
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
          currentPath={pathname || "/"}
          LinkComponent={Link}
          logo={<div className={styles.logoBadge}>TA</div>}
          footer={
            <div className={styles.footerCopy}>
              <p className={styles.footerTitle}>Storyweaver Console</p>
              <p className={styles.footerVersion}>Admin foundation</p>
            </div>
          }
          collapsible={false}
        />
      </aside>

      <div className={styles.contentArea}>
        <Header
          user={{
            fullName: getDisplayName(adminProfile, user.email),
            profileImageUrl:
              typeof adminProfile?.avatar === "string"
                ? adminProfile.avatar
                : typeof adminProfile?.profileImageUrl === "string"
                  ? adminProfile.profileImageUrl
                  : null,
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
