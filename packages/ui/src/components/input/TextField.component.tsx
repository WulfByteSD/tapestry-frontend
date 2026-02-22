"use client";

import React from "react";
import clsx from "clsx";
import { Input, InputProps } from "./Input.component";
import styles from "./TextField.module.scss";

export type TextFieldProps = InputProps & {
  label?: string;
  hint?: string;
  error?: string;
};

export function TextField({ id, label, hint, error, className, ...inputProps }: TextFieldProps) {
  const hasError = Boolean(error) || Boolean(inputProps.hasError);

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
      ) : hint ? (
        <div className={styles.hint}>{hint}</div>
      ) : null}
    </div>
  );
}
