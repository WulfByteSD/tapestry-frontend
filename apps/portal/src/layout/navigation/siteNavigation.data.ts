export type SiteNavigationLink = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

export type SiteNavigationGroup = {
  title: string;
  links: SiteNavigationLink[];
};

export const primaryNavigationLinks: SiteNavigationLink[] = [
  {
    label: 'Why Tapestry',
    href: '/#difference',
  },
  {
    label: 'How It Plays',
    href: '/#how-it-plays',
  },
  {
    label: 'Community',
    href: '/#community',
  },
];

export const platformLinks: SiteNavigationLink[] = [
  {
    label: 'Player Portal',
    href: 'https://player.tapestry-ttrpg.com',
    description: 'Step into campaigns, character play, and session-ready tools.',
    external: true,
  }
];

export const primaryCallToAction: SiteNavigationLink = {
  label: 'Enter the Portal',
  href: 'https://player.tapestry-ttrpg.com',
  external: true,
};

export const secondaryCallToAction: SiteNavigationLink = {
  label: 'Contact',
  href: 'mailto:marketing@tapestry-ttrpg.com',
  external: true,
};

export const footerNavigationGroups: SiteNavigationGroup[] = [
  {
    title: 'Explore',
    links: primaryNavigationLinks,
  },
  {
    title: 'Portals',
    links: platformLinks,
  },
];

export const legalLinks: SiteNavigationLink[] = [secondaryCallToAction];
