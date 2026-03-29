'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './FormFieldFrame.module.scss';

export type FormFieldFrameRenderProps = {
  controlClassName?: string;
  describedBy?: string;
  showPlaceholder: boolean;
  isFloating: boolean;
};

export type FormFieldFrameProps = {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  floatingLabel?: boolean;
  isFloating?: boolean;
  hasError?: boolean;
  renderControl: (props: FormFieldFrameRenderProps) => React.ReactNode;
};

function FieldLabel({ id, className, children }: { id?: string; className?: string; children?: React.ReactNode }) {
  if (!children) return null;

  if (id) {
    return (
      <label className={className} htmlFor={id}>
        {children}
      </label>
    );
  }

  return <span className={className}>{children}</span>;
}

export function FormFieldFrame({ id, label, hint, error, className, floatingLabel = false, isFloating = false, hasError = false, renderControl }: FormFieldFrameProps) {
  const messageId = id && (error || hint) ? `${id}-message` : undefined;
  const showPlaceholder = !floatingLabel || isFloating;

  if (floatingLabel && label) {
    return (
      <div className={clsx(styles.field, className)}>
        <div className={clsx(styles.floatingWrap, isFloating && styles.floating, hasError && styles.hasError)}>
          {renderControl({
            controlClassName: styles.floatingInput,
            describedBy: messageId,
            showPlaceholder,
            isFloating,
          })}
          <FieldLabel id={id} className={styles.floatingLabel}>
            {label}
          </FieldLabel>
        </div>

        {error ? (
          <div id={messageId} className={styles.error} role="alert">
            {error}
          </div>
        ) : hint ? (
          <div id={messageId} className={styles.hint}>
            {hint}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={clsx(styles.field, className)}>
      <FieldLabel id={id} className={styles.label}>
        {label}
      </FieldLabel>

      {renderControl({
        describedBy: messageId,
        showPlaceholder: true,
        isFloating: false,
      })}

      {error ? (
        <div id={messageId} className={styles.error} role="alert">
          {error}
        </div>
      ) : hint ? (
        <div id={messageId} className={styles.hint}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
