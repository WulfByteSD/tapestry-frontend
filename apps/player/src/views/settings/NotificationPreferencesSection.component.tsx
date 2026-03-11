"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Switcher } from "@tapestry/ui";
import { useAlert } from "@tapestry/ui";
import {
  useDeletePushSubscription,
  useSavePushSubscription,
  useSendTestPush,
  useUpdateUserAccount,
} from "@/lib/settings-hooks";
import { getCurrentPushSubscription, getPushAvailability, registerPushSubscription, unregisterPushSubscription } from "@/lib/push-notifications";
import SmsOptInModal from "./SmsOptInModal.component";
import styles from "./AccountDetails.module.scss";

type NotificationSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
};

type Props = {
  userId?: string | null;
  notificationSettings?: Partial<NotificationSettings> | null;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: false,
};

export default function NotificationPreferencesSection({ userId, notificationSettings }: Props) {
  const { addAlert } = useAlert();
  const updateAccount = useUpdateUserAccount(userId);

  const [prefs, setPrefs] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [isPushBusy, setIsPushBusy] = useState(false);

  const pushAvailability = useMemo(() => getPushAvailability(), []);

  useEffect(() => {
    setPrefs({
      emailNotifications: notificationSettings?.emailNotifications ?? true,
      smsNotifications: notificationSettings?.smsNotifications ?? false,
      pushNotifications: notificationSettings?.pushNotifications ?? false,
    });
  }, [notificationSettings]);

  if (!userId) {
    return null;
  }

  async function persistSettings(next: NotificationSettings) {
    setPrefs(next);

    await updateAccount.mutateAsync({
      notificationSettings: next,
    });
  }

  async function handleEmailToggle(checked: boolean) {
    const next = {
      ...prefs,
      emailNotifications: checked,
    };

    await persistSettings(next);
  }

  function handleSmsToggle(checked: boolean) {
    if (checked) {
      setShowSmsModal(true);
      return;
    }

    void persistSettings({
      ...prefs,
      smsNotifications: false,
    });
  }

  async function handleConfirmSms() {
    setShowSmsModal(false);

    await persistSettings({
      ...prefs,
      smsNotifications: true,
    });
  }

  function handleCancelSms() {
    setShowSmsModal(false);
  }
  // inside component
  const savePushSubscription = useSavePushSubscription();
  const deletePushSubscription = useDeletePushSubscription();
  const sendTestPush = useSendTestPush();

  async function handlePushToggle(checked: boolean) {
    if (!pushAvailability.supported) {
      addAlert({
        type: "error",
        message: "Web push is not supported on this browser/device.",
      });
      return;
    }

    try {
      setIsPushBusy(true);

      if (checked) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
        }

        const subscription = await registerPushSubscription(vapidPublicKey);
        const json = subscription.toJSON();

        await savePushSubscription.mutateAsync({
          subscription: {
            endpoint: json.endpoint!,
            expirationTime: json.expirationTime ?? null,
            keys: {
              p256dh: json.keys!.p256dh,
              auth: json.keys!.auth,
            },
          },
          userAgent: navigator.userAgent,
          deviceName: "Current device",
        });

        await persistSettings({
          ...prefs,
          pushNotifications: true,
        });

        addAlert({
          type: "success",
          message: "Push notifications enabled for this device.",
        });
      } else {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const subscription = vapidPublicKey ? await registerPushSubscription(vapidPublicKey).catch(() => null) : null;

        const endpoint = subscription?.endpoint;

        if (endpoint) {
          await deletePushSubscription.mutateAsync({ endpoint });
        }
        const current = await getCurrentPushSubscription();
        if (current?.endpoint) {
          await deletePushSubscription.mutateAsync({ endpoint: current.endpoint });
        }
        await unregisterPushSubscription();
        await unregisterPushSubscription();

        await persistSettings({
          ...prefs,
          pushNotifications: false,
        });

        addAlert({
          type: "success",
          message: "Push notifications disabled for this device.",
        });
      }
    } catch (error: any) {
      addAlert({
        type: "error",
        message: error?.message || "Failed to update push notification settings.",
      });
    } finally {
      setIsPushBusy(false);
    }
  }

  return (
    <>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Notifications</h2>
            <p className={styles.sectionSubtitle}>Choose how Tapestry can reach you.</p>
          </div>
        </div>

        <div className={styles.preferenceList}>
          <div className={styles.preferenceRow}>
            <div className={styles.preferenceCopy}>
              <div className={styles.preferenceLabel}>Email notifications</div>
              <div className={styles.preferenceText}>
                Campaign invites, important account updates, and other email alerts. Important transactional emails
                (e.g. password reset) will still be sent even if this is turned off.
              </div>
            </div>

            <Switcher
              checked={prefs.emailNotifications}
              onChange={(checked) => void handleEmailToggle(checked)}
              disabled={updateAccount.isPending || isPushBusy}
            />
          </div>

          <div className={styles.preferenceRow}>
            <div className={styles.preferenceCopy}>
              <div className={styles.preferenceLabel}>SMS notifications</div>
              <div className={styles.preferenceText}>Receive text alerts. Enabling this requires explicit opt-in.</div>
            </div>

            <Switcher
              checked={prefs.smsNotifications}
              onChange={handleSmsToggle}
              disabled={updateAccount.isPending || isPushBusy || true}
            />
          </div>

          <div className={styles.preferenceRow}>
            <div className={styles.preferenceCopy}>
              <div className={styles.preferenceLabel}>Push notifications</div>
              <div className={styles.preferenceText}>
                Browser or installed web-app notifications for this device.
                {!pushAvailability.supported
                  ? " This browser/device does not support web push."
                  : pushAvailability.permission === "denied"
                    ? " Push permission is blocked in this browser."
                    : ""}
              </div>
            </div>

            <Switcher
              checked={prefs.pushNotifications}
              onChange={(checked) => void handlePushToggle(checked)}
              disabled={updateAccount.isPending || isPushBusy || !pushAvailability.supported}
            />
          </div>
        </div>

        {pushAvailability.supported && pushAvailability.permission !== "granted" ? (
          <div className={styles.preferenceNote}>
            Push permission will be requested when you enable push on this device.
          </div>
        ) : null}
      </section>

      <SmsOptInModal
        isVisible={showSmsModal}
        onConfirm={() => void handleConfirmSms()}
        onCancel={handleCancelSms}
        isLoading={updateAccount.isPending}
        businessName="Tapestry"
        messagesPerMonth={10}
      />
    </>
  );
}
