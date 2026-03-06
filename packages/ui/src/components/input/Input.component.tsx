"use client";

import React, { useState, useId } from "react";
import clsx from "clsx";
import styles from "./Input.module.scss";
import fieldStyles from "./TextField.module.scss";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: InputSize;
  hasError?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  showPasswordToggle?: boolean;
  label?: string;
  hint?: string;
  error?: string;
};

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {visible ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "md",
    hasError = false,
    leftSlot,
    rightSlot,
    showPasswordToggle = false,
    className,
    type,
    label,
    hint,
    error,
    id,
    ...rest
  },
  ref,
) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const hasErrorState = Boolean(error) || hasError;

  // Override type if password toggle is enabled
  const inputType = showPasswordToggle ? (passwordVisible ? "text" : "password") : type;

  const inputElement = (
    <div
      className={clsx(
        styles.wrap,
        styles[`size_${size}`],
        hasErrorState && styles.error,
        showPasswordToggle && styles.hasPasswordToggle,
        !label && className,
      )}
    >
      {leftSlot && <span className={styles.slotLeft}>{leftSlot}</span>}
      <input ref={ref} id={inputId} className={styles.input} type={inputType} {...rest} />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setPasswordVisible((v) => !v)}
          className={styles.passwordToggle}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          <EyeIcon visible={passwordVisible} />
        </button>
      )}
      {rightSlot && <span className={styles.slotRight}>{rightSlot}</span>}
    </div>
  );

  if (label) {
    return (
      <div className={clsx(fieldStyles.field, className)}>
        <label className={fieldStyles.label} htmlFor={inputId}>
          {label}
        </label>
        {inputElement}
        {error ? (
          <div className={fieldStyles.error} role="alert">
            {error}
          </div>
        ) : hint ? (
          <div className={fieldStyles.hint}>{hint}</div>
        ) : null}
      </div>
    );
  }

  return inputElement;
});
