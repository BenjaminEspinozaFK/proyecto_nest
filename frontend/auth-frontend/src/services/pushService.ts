import api from "./authService";

export const pushService = {
  async getVapidPublicKey(): Promise<string> {
    const response = await api.get<{ publicKey: string }>(
      "/push/vapid-public-key",
    );
    return response.data.publicKey;
  },

  async subscribe(subscription: PushSubscription): Promise<void> {
    const json = subscription.toJSON();
    await api.post("/push/subscribe", {
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      },
    });
  },

  async unsubscribe(endpoint: string): Promise<void> {
    await api.post("/push/unsubscribe", { endpoint });
  },
};
