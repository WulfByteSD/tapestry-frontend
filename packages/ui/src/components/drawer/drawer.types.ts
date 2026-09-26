import type { ReactNode } from 'react';

export type DrawerPlacement = 'left' | 'right';

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  width?: number | string;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};
