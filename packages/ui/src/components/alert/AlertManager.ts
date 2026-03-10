import type { AlertInput, AlertType } from "./alert.types";

type AlertCallback = (config: AlertInput, type?: AlertType, duration?: number) => string;

/**
 * Imperative Alert Manager
 * Allows calling alerts from outside React components (e.g., API interceptors, QueryClient callbacks)
 */
class AlertManager {
  private static instance: AlertManager;
  private callback: AlertCallback | null = null;

  private constructor() {}

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  /**
   * Register the alert callback from the AlertProvider
   * @internal - Called by AlertProvider, not for external use
   */
  register(callback: AlertCallback): void {
    this.callback = callback;
  }

  /**
   * Unregister the alert callback
   * @internal - Called by AlertProvider, not for external use
   */
  unregister(): void {
    this.callback = null;
  }

  /**
   * Add an alert imperatively from anywhere in your app
   *
   * @example
   * ```ts
   * // String shorthand
   * AlertManager.getInstance().addAlert("Success!", "success");
   *
   * // Full config
   * AlertManager.getInstance().addAlert({
   *   message: "Error occurred",
   *   type: "error",
   *   duration: 5000,
   * });
   * ```
   */
  addAlert(config: AlertInput, type?: AlertType, duration?: number): string | null {
    if (!this.callback) {
      console.warn("AlertManager: No alert callback registered. Make sure AlertProvider is mounted.");
      return null;
    }
    return this.callback(config, type, duration);
  }
}

// Export singleton instance for convenience
export const alertManager = AlertManager.getInstance();

// Export class for typing if needed
export default AlertManager;
