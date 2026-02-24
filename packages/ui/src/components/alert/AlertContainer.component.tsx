"use client";

import React from "react";
import clsx from "clsx";
import { useAlert } from "./AlertContext";
import Alert from "./Alert.component";
import styles from "./AlertContainer.module.scss";
import type { AlertContainerProps } from "./alert.types";

export function AlertContainer({ position = "top-right", className }: AlertContainerProps) {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className={clsx(styles.alertContainer, styles[position], className)}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          description={alert.description}
          showIcon={alert.showIcon}
          closable
          onClose={() => removeAlert(alert.id)}
          className={styles.alert}
        />
      ))}
    </div>
  );
}

export default AlertContainer;
