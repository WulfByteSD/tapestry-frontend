import { AxiosInstance } from "axios";

export type PushSubscriptionJson = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function savePushSubscription(
  api: AxiosInstance,
  input: {
    subscription: PushSubscriptionJson;
    deviceName?: string;
    userAgent?: string;
  },
) {
  const res = await api.post("/notification/subscriptions", input);
  return res.data.payload;
}

export async function deletePushSubscription(api: AxiosInstance, input: { endpoint: string }) {
  const res = await api.delete("/notification/subscriptions", {
    data: input,
  });
  return res.data;
}

export async function sendTestPush(api: AxiosInstance) {
  const res = await api.post("/notification/test");
  return res.data.payload;
}
