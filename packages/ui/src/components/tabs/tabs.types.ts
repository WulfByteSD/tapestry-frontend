import type { ReactNode } from "react";

export type TabsVariant = "pills" | "underline";
export type TabsFit = "equal" | "content";

export interface TabsItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}

export interface TabsProps {
  items: TabsItem[];

  // Controlled
  activeKey?: string;
  onChange?: (key: string) => void;

  // Uncontrolled
  defaultActiveKey?: string;

  variant?: TabsVariant; // default: "pills"
  fit?: TabsFit; // default: "equal"
  keepMounted?: boolean; // default: true

  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;

  ariaLabel?: string;
}
