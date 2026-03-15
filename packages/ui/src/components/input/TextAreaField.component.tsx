"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { TextArea, TextAreaProps } from "./TextArea.component";
import styles from "./TextAreaField.module.scss";

export type TextAreaFieldProps = TextAreaProps & {
  label?: string;
  hint?: string;
  helpText?: string;
  error?: string;
  floatingLabel?: boolean;
};

export function TextAreaField({
  id,
  label,
  hint,
  helpText,
  error,
  className,
  floatingLabel = false,
  ...textAreaProps
}: TextAreaFieldProps) {
  const displayHint = helpText ?? hint;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(textAreaProps.value || textAreaProps.defaultValue));
  const hasError = Boolean(error) || Boolean(textAreaProps.hasError);
  const isFloating = isFocused || hasValue;

  // Check for value on mount
  useEffect(() => {
    if (textAreaRef.current && textAreaRef.current.value) {
      setHasValue(true);
    }
  }, []);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    textAreaProps.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(Boolean(e.target.value));
    textAreaProps.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(Boolean(e.target.value));
    textAreaProps.onChange?.(e);
  };

  if (floatingLabel && label) {
    return (
      <div className={clsx(styles.field, className)}>
        <div className={clsx(styles.floatingWrap, isFloating && styles.floating, hasError && styles.hasError)}>
          <TextArea
            ref={textAreaRef}
            id={id}
            {...textAreaProps}
            hasError={hasError}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={styles.floatingInput}
            placeholder={isFloating ? textAreaProps.placeholder : undefined}
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

      <TextArea id={id} {...textAreaProps} hasError={hasError} />

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
