import type { ReactNode, CSSProperties } from "react";

export type AlertType = "success" | "info" | "warning" | "error";

export type AlertProps = {
  /** Type of alert - determines color and icon */
  type?: AlertType;
  /** Main message to display */
  message: ReactNode;
  /** Optional description for more detailed information */
  description?: ReactNode;
  /** Whether the alert can be closed */
  closable?: boolean;
  /** Callback when alert is closed */
  onClose?: () => void;
  /** Custom close text/icon */
  closeText?: ReactNode;
  /** Show icon based on alert type */
  showIcon?: boolean;
  /** Custom icon to override default */
  icon?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Banner style (full width, no border radius) */
  banner?: boolean;
};

export type AlertConfig = {
  /** Unique ID for the alert */
  id: string;
  /** Alert type */
  type: AlertType;
  /** Main message */
  message: ReactNode;
  /** Optional description */
  description?: ReactNode;
  /** Show icon */
  showIcon?: boolean;
  /** Duration in ms before auto-dismiss (0 or undefined = no auto-dismiss) */
  duration?: number;
  /** If true, alert won't auto-dismiss regardless of duration */
  persistent?: boolean;
};

export type AlertInput = Omit<AlertConfig, "id"> | string;

export type AlertContextValue = {
  alerts: AlertConfig[];
  addAlert: (config: AlertInput, type?: AlertType, duration?: number) => string;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
};

export type AlertProviderProps = {
  children: ReactNode;
  /** Default duration for alerts (in ms) */
  defaultDuration?: number;
  /** Maximum number of alerts to show at once */
  maxAlerts?: number;
};

export type AlertContainerProps = {
  /** Position of the alert container */
  position?: "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center";
  /** Additional CSS class */
  className?: string;
};
