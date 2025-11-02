import api from "./authService";

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  // Depending on the action, it could be user data or message
  [key: string]: any;
}

export const adminService = {
  async sendChatMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await api.post<ChatResponse>("/admins/chat", { message });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error sending chat message");
    }
  },

  async getUsers() {
    try {
      const response = await api.get("/admins/users");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error fetching users");
    }
  },

  async updateUser(id: string, userData: any) {
    try {
      const response = await api.put(`/admins/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error updating user");
    }
  },

  async deleteUser(id: string) {
    try {
      const response = await api.delete(`/admins/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error deleting user");
    }
  },
};
