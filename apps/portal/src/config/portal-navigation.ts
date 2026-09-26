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
  {
    label: 'Resources',
    items: [
      {
        label: 'Players',
        href: portalRoutes.resources.players,
      },
      {
        label: 'Storyweavers',
        href: portalRoutes.resources.storyweavers,
      },
      {
        label: 'Adversaries',
        href: portalRoutes.resources.adversaries,
      },
      {
        label: 'Unwoven Compendium',
        href: portalRoutes.resources.unwoven,
      },
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

export const portalFooterGroups = [
  // {
  //   title: 'Shop',
  //   links: [
  //     {
  //       label: 'Shop',
  //       href: portalRoutes.shop,
  //     },
  //   ],
  // },
  {
    title: 'Resources',
    links: [
      {
        label: 'Players',
        href: portalRoutes.resources.players,
      },
      {
        label: 'Storyweavers',
        href: portalRoutes.resources.storyweavers,
      },
      {
        label: 'Adversaries',
        href: portalRoutes.resources.adversaries,
      },
      {
        label: 'Unwoven Compendium',
        href: portalRoutes.resources.unwoven,
      },
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
    label: 'Get the Players Guide',
    href: portalRoutes.getPlayersGuide,
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
