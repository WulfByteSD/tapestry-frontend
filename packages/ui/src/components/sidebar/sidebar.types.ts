export type SidebarLink = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number; // For notification counts
  hideOnMobile?: boolean; // Hide this link on mobile layouts
  children?: SidebarLink[]; // For nested/hierarchical menu items
};

export type SidebarGroup = {
  title: string;
  links: SidebarLink[];
};
