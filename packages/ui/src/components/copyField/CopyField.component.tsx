'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { FaCheck, FaCopy } from 'react-icons/fa';
import { useAlert } from '../alert';
import styles from './CopyField.module.scss';

export type CopyFieldVariant = 'inline' | 'field' | 'badge';
export type CopyFieldDisplayAs = 'text' | 'link' | 'code';
export type CopyFieldSize = 'sm' | 'md' | 'lg';
export type CopyFieldTone = 'neutral' | 'purple' | 'gold';

export type CopyFieldProps = {
  value: string;
  label?: string;
  variant?: CopyFieldVariant;
  displayAs?: CopyFieldDisplayAs;
  href?: string;
  className?: string;
  copyMessage?: string;
  showCopyButton?: boolean;
  truncate?: boolean | number;
  size?: CopyFieldSize;
  tone?: CopyFieldTone;
};

function truncateValue(value: string, truncate: boolean | number): string {
  if (!truncate) return value;

  const maxLength = typeof truncate === 'number' ? truncate : 32;

  if (value.length <= maxLength) return value;

  // For IDs and hashes, show first and last chars
  if (maxLength > 10) {
    const sideLength = Math.floor((maxLength - 3) / 2);
    return `${value.slice(0, sideLength)}...${value.slice(-sideLength)}`;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

export function CopyField({
  value,
  label,
  variant = 'field',
  displayAs = 'text',
  href,
  className,
  copyMessage = 'Copied to clipboard',
  showCopyButton = true,
  truncate = false,
  size = 'md',
  tone = 'neutral',
}: CopyFieldProps) {
  const { addAlert } = useAlert();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      addAlert({
        type: 'success',
        message: copyMessage,
        duration: 2000,
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Failed to copy',
        duration: 2000,
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCopy();
    }
  };

  const displayValue = truncate ? truncateValue(value, truncate) : value;

  const renderValue = () => {
    const baseClassName = clsx(styles.value, {
      [styles.valueCode]: displayAs === 'code',
      [styles.valueLink]: displayAs === 'link',
    });

    if (displayAs === 'link') {
      return (
        <a href={href || value} target="_blank" rel="noopener noreferrer" className={baseClassName} title={value}>
          {displayValue}
        </a>
      );
    }

    if (displayAs === 'code') {
      return (
        <code className={baseClassName} title={value}>
          {displayValue}
        </code>
      );
    }

    return (
      <span className={baseClassName} title={value}>
        {displayValue}
      </span>
    );
  };

  const containerClassName = clsx(styles.container, styles[`variant-${variant}`], styles[`size-${size}`], styles[`tone-${tone}`], className);

  const copyButton = showCopyButton && (
    <button
      type="button"
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      className={clsx(styles.copyButton, { [styles.copied]: copied })}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? <FaCheck className={styles.icon} /> : <FaCopy className={styles.icon} />}
    </button>
  );

  if (variant === 'inline') {
    return (
      <div className={containerClassName}>
        {label && <span className={styles.inlineLabel}>{label}:</span>}
        {renderValue()}
        {copyButton}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={containerClassName}>
        {label && <span className={styles.badgeLabel}>{label}:</span>}
        {renderValue()}
        {copyButton}
      </div>
    );
  }

  // variant === 'field'
  return (
    <div className={containerClassName}>
      {label && <label className={styles.fieldLabel}>{label}</label>}
      <div className={styles.fieldContent}>
        {renderValue()}
        {copyButton}
      </div>
    </div>
  );
}
