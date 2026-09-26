import type { AxiosInstance } from 'axios';

export type NotificationFeatureFlags = {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
};

export type AccountDetailsProps = {
  userId: string;
  api: AxiosInstance;
  onSaveSuccess?: () => void;
  onPasswordSuccess?: () => void;
  /**
   * Controls which notification toggles are enabled (billing-gated).
   * Defaults: email=true, sms=false, push=false.
   * Disabled toggles are always rendered but non-interactive.
   */
  notificationFeatures?: NotificationFeatureFlags;
  /**
   * Optional intercept for the SMS toggle — used by the player app to
   * show an SmsOptInModal before committing the value.
   */
  onSmsToggle?: (enabled: boolean) => void;
  /**
   * Explicit override for whether to show the Danger Zone / Cancel Account section.
   * When omitted, the section is shown automatically if the billing record has a
   * payment processor attached (i.e. `billing.processor` is truthy).
   * Pass `false` to hide it regardless (e.g. admin / scout consumers).
   * Pass `true` to force-show it even on accounts without a processor.
   */
  showCancelSection?: boolean;
  /**
   * Called after a successful account cancellation so the consumer can
   * redirect, refetch, or show a notification.
   */
  onCancelSuccess?: () => void;
};
