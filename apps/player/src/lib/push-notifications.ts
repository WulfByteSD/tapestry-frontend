"use client";

export type PushAvailability = {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
};

export function isWebPushSupported() {
  return (
    typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window
  );
}

export function getPushAvailability(): PushAvailability {
  if (!isWebPushSupported()) {
    return {
      supported: false,
      permission: "unsupported",
    };
  }

  return {
    supported: true,
    permission: Notification.permission,
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function registerPushSubscription(vapidPublicKey: string) {
  if (!isWebPushSupported()) {
    throw new Error("Web push is not supported on this browser/device.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  const readyRegistration = await navigator.serviceWorker.ready;

  let permission = Notification.permission;

  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error("Push notification permission was not granted.");
  }

  const existing = await readyRegistration.pushManager.getSubscription();
  if (existing) {
    return existing;
  }

  return readyRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

export async function unregisterPushSubscription() {
  if (!isWebPushSupported()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return true;
  }

  return subscription.unsubscribe();
}
export async function getCurrentPushSubscription() {
  if (!isWebPushSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}
