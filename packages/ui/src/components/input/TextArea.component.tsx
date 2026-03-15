"use client";

import React, { useId } from "react";
import clsx from "clsx";
import styles from "./Input.module.scss";
import fieldStyles from "./TextField.module.scss";

export type TextAreaSize = "sm" | "md" | "lg";

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  size?: TextAreaSize;
  hasError?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  resize?: "none" | "vertical" | "horizontal" | "both";
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { size = "md", hasError = false, className, label, hint, error, id, resize = "vertical", ...rest },
  ref,
) {
  const generatedId = useId();
  const textAreaId = id || generatedId;
  const hasErrorState = Boolean(error) || hasError;

  const textAreaElement = (
    <div className={clsx(styles.wrap, styles[`size_${size}`], hasErrorState && styles.error, !label && className)}>
      <textarea
        ref={ref}
        id={textAreaId}
        className={clsx(styles.input, styles.textarea)}
        style={{ resize }}
        {...rest}
      />
    </div>
  );

  if (label) {
    return (
      <div className={clsx(fieldStyles.field, className)}>
        <label htmlFor={textAreaId} className={fieldStyles.label}>
          {label}
        </label>
        {textAreaElement}
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

  return textAreaElement;
});
