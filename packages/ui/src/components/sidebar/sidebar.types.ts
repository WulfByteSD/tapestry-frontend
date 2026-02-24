export type SidebarLink = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number; // For notification counts
};

export type SidebarGroup = {
  title: string;
  links: SidebarLink[];
};
