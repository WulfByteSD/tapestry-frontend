"use client";

import React, { useId } from "react";
import clsx from "clsx";
import styles from "./Checkbox.module.scss";

export type CheckboxSize = "sm" | "md" | "lg";

export type CheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: CheckboxSize;
  label?: string;
  className?: string;
  id?: string;
  indeterminate?: boolean;
};

export default function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  label,
  className,
  id: providedId,
  indeterminate = false,
}: CheckboxProps) {
  const generatedId = useId();
  const id = providedId || generatedId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label
      className={clsx(
        styles.checkbox,
        styles[`size_${size}`],
        disabled && styles.disabled,
        checked && styles.checked,
        indeterminate && styles.indeterminate,
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
        aria-checked={indeterminate ? "mixed" : checked}
      />
      <span className={styles.box}>
        {indeterminate ? (
          <svg className={styles.icon} viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : checked ? (
          <svg className={styles.icon} viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
