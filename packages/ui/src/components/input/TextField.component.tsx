"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { Input, InputProps } from "./Input.component";
import styles from "./TextField.module.scss";

export type TextFieldProps = InputProps & {
  label?: string;
  hint?: string;
  helpText?: string;
  error?: string;
  floatingLabel?: boolean;
};

export function TextField({
  id,
  label,
  hint,
  helpText,
  error,
  className,
  floatingLabel = false,
  ...inputProps
}: TextFieldProps) {
  const displayHint = helpText ?? hint;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(inputProps.value || inputProps.defaultValue));
  const hasError = Boolean(error) || Boolean(inputProps.hasError);
  const isFloating = isFocused || hasValue;

  // Check for autofill on mount and periodically
  useEffect(() => {
    const checkAutofill = () => {
      if (inputRef.current) {
        const hasAutofill = inputRef.current.matches(":-webkit-autofill");
        const currentValue = inputRef.current.value;
        if (hasAutofill || currentValue) {
          setHasValue(true);
        }
      }
    };

    // Check immediately and after a short delay (for autofill)
    checkAutofill();
    const timer = setTimeout(checkAutofill, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    inputProps.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(Boolean(e.target.value));
    inputProps.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value));
    inputProps.onChange?.(e);
  };

  if (floatingLabel && label) {
    return (
      <div className={clsx(styles.field, className)}>
        <div className={clsx(styles.floatingWrap, isFloating && styles.floating, hasError && styles.hasError)}>
          <Input
            ref={inputRef}
            id={id}
            {...inputProps}
            hasError={hasError}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={styles.floatingInput}
            placeholder={isFloating ? inputProps.placeholder : undefined}
          />
          <label className={styles.floatingLabel} htmlFor={id}>
            {label}
          </label>
        </div>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : displayHint ? (
          <div className={styles.hint}>{displayHint}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <Input id={id} {...inputProps} hasError={hasError} />

      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : displayHint ? (
        <div className={styles.hint}>{displayHint}</div>
      ) : null}
    </div>
  );
}
