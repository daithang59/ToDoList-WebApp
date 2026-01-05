import { api } from "../api";

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const canUsePush = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  Boolean(vapidPublicKey);

export const getExistingSubscription = async () => {
  if (!canUsePush()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
};

export const registerPushSubscription = async (ownerId) => {
  if (!canUsePush()) {
    return { enabled: false, reason: "unsupported" };
  }
  if (!ownerId) {
    return { enabled: false, reason: "missing_owner" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { enabled: false, reason: "permission_denied" };
  }

  const registration =
    (await navigator.serviceWorker.getRegistration()) ||
    (await navigator.serviceWorker.register("/sw.js"));

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    }));

  await api.post("/notifications/subscribe", { ownerId, subscription });
  return { enabled: true, subscription };
};

export const unregisterPushSubscription = async (ownerId) => {
  if (!canUsePush()) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return false;

  await api.delete("/notifications/subscribe", {
    data: { ownerId, endpoint: subscription.endpoint },
  });
  await subscription.unsubscribe();
  return true;
};
