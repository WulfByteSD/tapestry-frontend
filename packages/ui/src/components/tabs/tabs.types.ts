import type { ReactNode } from 'react';

export type TabsVariant = 'pills' | 'underline';
export type TabsFit = 'equal' | 'content';

export interface TabsItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** When true, renders a close button on the tab. Wire `onRemove` on `TabsProps` to handle removal. */
  closable?: boolean;
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
  hideTabList?: boolean; // default: false

  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;

  ariaLabel?: string;
  /** Called when the user closes a tab (close button click or Delete/Backspace on focused closable tab). */
  onRemove?: (key: string) => void;
}
