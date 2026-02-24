"use client";

import React, { useState } from "react";
import clsx from "clsx";
import styles from "./Alert.module.scss";
import type { AlertType, AlertProps } from "./alert.types";

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const InfoCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const defaultIcons: Record<AlertType, React.ReactNode> = {
  success: <CheckCircleIcon />,
  info: <InfoCircleIcon />,
  warning: <AlertTriangleIcon />,
  error: <XCircleIcon />,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    type = "info",
    message,
    description,
    closable = false,
    onClose,
    closeText,
    showIcon = false,
    icon,
    className,
    style,
    banner = false,
  },
  ref,
) {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const displayIcon = icon || defaultIcons[type];

  return (
    <div
      ref={ref}
      className={clsx(
        styles.alert,
        styles[type],
        showIcon && styles.withIcon,
        description && styles.withDescription,
        banner && styles.banner,
        className,
      )}
      style={style}
      role="alert"
    >
      {showIcon && <div className={styles.icon}>{displayIcon}</div>}

      <div className={styles.content}>
        <div className={styles.message}>{message}</div>
        {description && <div className={styles.description}>{description}</div>}
      </div>

      {closable && (
        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close alert">
          {closeText || <CloseIcon />}
        </button>
      )}
    </div>
  );
});

export default Alert;
