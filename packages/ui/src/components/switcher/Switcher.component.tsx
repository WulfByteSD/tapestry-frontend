"use client";

import React, { useId } from "react";
import clsx from "clsx";
import styles from "./Switcher.module.scss";

export type SwitcherSize = "sm" | "md" | "lg";

export type SwitcherProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitcherSize;
  label?: string;
  className?: string;
  id?: string;
};

export default function Switcher({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  label,
  className,
  id: providedId,
}: SwitcherProps) {
  const generatedId = useId();
  const id = providedId || generatedId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };

  const switchElement = (
    <label
      className={clsx(
        styles.switcher,
        styles[`size_${size}`],
        disabled && styles.disabled,
        checked && styles.checked,
        className,
      )}
      htmlFor={id}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={styles.input}
        aria-checked={checked}
        role="switch"
      />
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );

  return switchElement;
}
