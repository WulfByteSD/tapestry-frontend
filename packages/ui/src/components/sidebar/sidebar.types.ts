export type SidebarLink = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number; // For notification counts
  children?: SidebarLink[]; // For nested/hierarchical menu items
};

export type SidebarGroup = {
  title: string;
  links: SidebarLink[];
};
