import { useCallback, useEffect, useState } from "react";
import { pushService } from "../services/pushService";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export const usePushNotifications = () => {
  const isSupported =
    "serviceWorker" in navigator && "PushManager" in window;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error("Error verificando suscripción push:", err);
    }
  }, [isSupported]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async () => {
    if (!isSupported) {
      setError("Tu navegador no soporta notificaciones push");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Debes permitir las notificaciones para activarlas");
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const publicKey = await pushService.getVapidPublicKey();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await pushService.subscribe(subscription);
      setIsSubscribed(true);
    } catch (err: any) {
      setError(err.message || "Error activando notificaciones push");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await pushService.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
    } catch (err: any) {
      setError(err.message || "Error desactivando notificaciones push");
    } finally {
      setLoading(false);
    }
  };

  return { isSupported, isSubscribed, loading, error, subscribe, unsubscribe };
};
