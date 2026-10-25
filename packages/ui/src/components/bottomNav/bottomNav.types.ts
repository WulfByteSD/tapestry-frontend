import type { ReactNode, ComponentType } from 'react';

export type BottomNavLink = {
  href: string;
  label: string;
  icon: ReactNode;
  /** Count displayed on this destination. Zero and negative values are not rendered. */
  badge?: number;
  /** Accessible context for the badge count, for example "3 unread notifications". */
  badgeAriaLabel?: string;
};

export type BottomNavSideLinks = [] | [BottomNavLink] | [BottomNavLink, BottomNavLink];

export type BottomNavExpressiveLayout = {
  left?: BottomNavSideLinks;
  center: BottomNavLink;
  right?: BottomNavSideLinks;
};

type BottomNavSharedProps = {
  currentPath: string;
  LinkComponent?: ComponentType<{ href: string; className?: string; children?: ReactNode; onClick?: () => void }> | string;
  className?: string;
  labels?: boolean;
};

export type BottomNavStandardProps = BottomNavSharedProps & {
  variant?: 'standard';
  links: BottomNavLink[];
  layout?: never;
};

export type BottomNavExpressiveProps = BottomNavSharedProps & {
  variant: 'expressive';
  links?: never;
  layout: BottomNavExpressiveLayout;
};

export type BottomNavProps = BottomNavStandardProps | BottomNavExpressiveProps;
