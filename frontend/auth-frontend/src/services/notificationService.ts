import api from "./authService";
import { Notification } from "../types/notification";

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get<Notification[]>("/notifications");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error obteniendo notificaciones",
      );
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<{ count: number }>(
        "/notifications/unread-count",
      );
      return response.data.count;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error obteniendo notificaciones sin leer",
      );
    }
  },

  async markAsRead(id: string): Promise<{ message: string }> {
    try {
      const response = await api.patch<{ message: string }>(
        `/notifications/${id}/read`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error marcando notificación como leída",
      );
    }
  },

  async markAllAsRead(): Promise<{ message: string }> {
    try {
      const response = await api.patch<{ message: string }>(
        "/notifications/read-all",
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error marcando notificaciones como leídas",
      );
    }
  },
};
