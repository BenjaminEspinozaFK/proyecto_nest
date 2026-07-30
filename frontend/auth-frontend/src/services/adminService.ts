import api from "./authService";

export const adminService = {
  async getStats() {
    try {
      const response = await api.get("/admins/stats");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error fetching stats");
    }
  },

  async getMyProfile() {
    try {
      const response = await api.get("/admins/me");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error fetching profile",
      );
    }
  },

  async updateMyProfile(data: any) {
    try {
      const response = await api.put("/admins/me", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error updating profile",
      );
    }
  },

  async getUsers() {
    try {
      const response = await api.get("/admins/users?page=1&limit=1000");
      return response.data.data;
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

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.patch("/admins/me/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
