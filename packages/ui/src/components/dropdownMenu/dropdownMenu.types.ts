import { ReactNode } from 'react';

export type DropdownMenuVariant = 'default' | 'danger';
export type DropdownMenuAlign = 'left' | 'right';
export type DropdownMenuPosition = 'top' | 'bottom';
export type DropdownMenuOpenOn = 'click' | 'hover';

// Discriminated union: either a divider or an action item
export type DropdownMenuItem =
  | {
      divider: true;
    }
  | {
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      variant?: DropdownMenuVariant;
      disabled?: boolean;
      divider?: false;
    };

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger: ReactNode;
  openOn?: DropdownMenuOpenOn;
  closeOnSelect?: boolean;
  align?: DropdownMenuAlign;
  position?: DropdownMenuPosition;
  className?: string;
}
