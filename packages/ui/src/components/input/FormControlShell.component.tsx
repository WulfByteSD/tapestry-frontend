'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './FormControlShell.module.scss';

export type FormControlSize = 'sm' | 'md' | 'lg';

export type FormControlShellProps = {
  size?: FormControlSize;
  hasError?: boolean;
  disabled?: boolean;
  focused?: boolean;
  className?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

export function FormControlShell({ size = 'md', hasError = false, disabled = false, focused = false, className, leftSlot, rightSlot, children }: FormControlShellProps) {
  return (
    <div className={clsx(styles.shell, styles[`size_${size}`], hasError && styles.error, disabled && styles.disabled, focused && styles.focused, className)}>
      {leftSlot ? <span className={styles.slotLeft}>{leftSlot}</span> : null}
      <div className={styles.control}>{children}</div>
      {rightSlot ? <span className={styles.slotRight}>{rightSlot}</span> : null}
    </div>
  );
}
