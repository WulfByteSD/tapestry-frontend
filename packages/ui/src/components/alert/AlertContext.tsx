"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import type { AlertType, AlertConfig, AlertInput, AlertContextValue, AlertProviderProps } from "./alert.types";

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children, defaultDuration = 4500, maxAlerts = 5 }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));

    // Clean up timer if exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addAlert = useCallback(
    (config: AlertInput, type?: AlertType, duration?: number): string => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      let alertConfig: AlertConfig;

      // Handle string shorthand: addAlert("Message", "success", 3000)
      if (typeof config === "string") {
        alertConfig = {
          id,
          message: config,
          type: type || "info",
          duration: duration ?? defaultDuration,
          showIcon: true,
        };
      } else {
        // Handle full config object
        alertConfig = {
          id,
          ...config,
          duration: config.duration ?? defaultDuration,
        };
      }

      setAlerts((prev) => {
        const newAlerts = [...prev, alertConfig];
        // Limit number of alerts
        if (newAlerts.length > maxAlerts) {
          // Remove oldest alert
          const removed = newAlerts.shift();
          if (removed) {
            const timer = timersRef.current.get(removed.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return newAlerts;
      });

      // Set up auto-dismiss timer if not persistent and has duration
      if (!alertConfig.persistent && alertConfig.duration && alertConfig.duration > 0) {
        const timer = setTimeout(() => {
          removeAlert(id);
        }, alertConfig.duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, maxAlerts, removeAlert],
  );

  const clearAllAlerts = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setAlerts([]);
  }, []);

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const value: AlertContextValue = {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

/**
 * Hook to access alert context for showing/hiding alerts.
 *
 * @example
 * ```tsx
 * const { addAlert } = useAlert();
 *
 * // String shorthand
 * addAlert("Character deleted!", "success");
 *
 * // Full config
 * addAlert({
 *   message: "Error saving character",
 *   description: "Please try again",
 *   type: "error",
 *   showIcon: true,
 *   persistent: true, // Won't auto-dismiss
 * });
 * ```
 */
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
}
