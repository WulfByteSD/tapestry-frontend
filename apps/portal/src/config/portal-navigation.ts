import { playerAppLinks } from './player-app';
import { portalRoutes } from './portal-routes';

export type PortalNavigationLink = {
  label: string;
  href: string;
};

export type PortalNavigationGroup = {
  label: string;
  items: readonly PortalNavigationLink[];
};

export type PortalNavigationItem = PortalNavigationLink | PortalNavigationGroup;

export type PortalFooterGroup = {
  title: string;
  links: readonly PortalNavigationLink[];
};

export const portalNavigation = [
  {
    label: 'Home',
    href: portalRoutes.home,
  },
  { label: 'Catalogue', href: portalRoutes.shop },
  {
    label: 'Resources',
    items: [
      { label: 'Free downloads', href: '/resources#collection' },
      { label: "Player's Guide", href: '/product/tapestry-players-guide' },
      { label: 'Quickstart Guide', href: '/resources/books/tapestry-quickstart-guide' },
      { label: 'Character Sheet', href: '/resources/books/tapestry-character-sheet' },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'Woven Realms',
        href: portalRoutes.settings.wovenRealms,
      },
    ],
  },
] as const satisfies readonly PortalNavigationItem[];

export const portalUtilityLinks: readonly PortalNavigationLink[] = [{ label: 'Player app', href: playerAppLinks.home }];

export const portalFooterGroups = [
  { title: 'Account', links: [
    { label: 'Open the player app', href: playerAppLinks.home },
    { label: 'Sign in', href: playerAppLinks.login },
    { label: 'Create an account', href: playerAppLinks.register },
  ] },
  { title: 'Catalogue', links: [{ label: 'Explore the books', href: portalRoutes.shop }] },
  {
    title: 'Resources',
    links: [
      { label: 'Free downloads', href: '/resources#collection' },
      { label: "Player's Guide", href: '/product/tapestry-players-guide' },
      { label: 'Quickstart Guide', href: '/resources/books/tapestry-quickstart-guide' },
      { label: 'Character Sheet', href: '/resources/books/tapestry-character-sheet' },
    ],
  },
  {
    title: 'Settings',
    links: [
      {
        label: 'Woven Realms',
        href: portalRoutes.settings.wovenRealms,
      },
    ],
  },
] as const satisfies readonly PortalFooterGroup[];

export const portalCtas = {
  getPlayersGuide: {
    label: 'Get the free guides',
    href: '/resources#collection',
  },
  cart: {
    label: 'Cart',
    href: portalRoutes.cart,
  },
  checkout: {
    label: 'Checkout',
    href: portalRoutes.checkout,
  },
} as const;
