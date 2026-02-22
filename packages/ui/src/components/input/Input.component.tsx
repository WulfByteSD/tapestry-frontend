"use client";

import React from "react";
import clsx from "clsx";
import styles from "./Input.module.scss";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: InputSize;
  hasError?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", hasError = false, leftSlot, rightSlot, className, ...rest },
  ref,
) {
  return (
    <div className={clsx(styles.wrap, styles[`size_${size}`], hasError && styles.error, className)}>
      {leftSlot && <span className={styles.slotLeft}>{leftSlot}</span>}
      <input ref={ref} className={styles.input} {...rest} />
      {rightSlot && <span className={styles.slotRight}>{rightSlot}</span>}
    </div>
  );
});
