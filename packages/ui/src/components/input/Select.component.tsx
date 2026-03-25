'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './Select.module.scss';

export type SelectSize = 'sm' | 'md' | 'lg';

export type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  size?: SelectSize;
  hasError?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  options?: SelectOption[];
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', hasError = false, leftSlot, rightSlot, className, options, children, ...rest },
  ref
) {
  const content = options
    ? options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))
    : children;

  return (
    <div className={clsx(styles.wrap, styles[`size_${size}`], hasError && styles.error, className)}>
      {leftSlot && <span className={styles.slotLeft}>{leftSlot}</span>}
      <select ref={ref} className={styles.select} {...rest}>
        {content}
      </select>
      {rightSlot && <span className={styles.slotRight}>{rightSlot}</span>}
    </div>
  );
});
