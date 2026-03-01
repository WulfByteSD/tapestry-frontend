"use client";

import React from "react";
import clsx from "clsx";
import styles from "./Select.module.scss";

export type SelectSize = "sm" | "md" | "lg";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  size?: SelectSize;
  hasError?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = "md", hasError = false, leftSlot, rightSlot, className, children, ...rest },
  ref,
) {
  return (
    <div className={clsx(styles.wrap, styles[`size_${size}`], hasError && styles.error, className)}>
      {leftSlot && <span className={styles.slotLeft}>{leftSlot}</span>}
      <select ref={ref} className={styles.select} {...rest}>
        {children}
      </select>
      {rightSlot && <span className={styles.slotRight}>{rightSlot}</span>}
    </div>
  );
});
