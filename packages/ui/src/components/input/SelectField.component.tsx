"use client";

import React from "react";
import clsx from "clsx";
import { Select, SelectProps } from "./Select.component";
import styles from "./TextField.module.scss";

export type SelectFieldProps = SelectProps & {
  label?: string;
  hint?: string;
  error?: string;
};

export function SelectField({ id, label, hint, error, className, children, ...selectProps }: SelectFieldProps) {
  const hasError = Boolean(error) || Boolean(selectProps.hasError);

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <Select id={id} {...selectProps} hasError={hasError}>
        {children}
      </Select>

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
