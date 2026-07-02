import axios from "axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  Session,
  User,
} from "../types/auth";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/auth/2fa/") ||
        originalRequest.url?.includes("/auth/refresh");

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        localStorage.setItem("authToken", access_token);
        localStorage.setItem("refreshToken", newRefreshToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const authService = {
  async login(
    data: LoginRequest,
  ): Promise<AuthResponse | { requires2FA: true; message: string }> {
    try {
      const response = await api.post("/auth/login", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error en el login");
    }
  },

  async loginWith2FA(
    data: LoginRequest & { code: string },
  ): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/2fa/login", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error en la verificación 2FA");
    }
  },

  async generate2FA(): Promise<{ secret: string; qrCode: string }> {
    try {
      const response = await api.post<{ secret: string; qrCode: string }>(
        "/auth/2fa/generate",
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error generando 2FA");
    }
  },

  async enable2FA(code: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        "/auth/2fa/enable",
        { code },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error activando 2FA");
    }
  },

  async disable2FA(code: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        "/auth/2fa/disable",
        { code },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error desactivando 2FA",
      );
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>(
        "/auth/register",
        data,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error en el registro");
    }
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await api.get<{ message: string }>(
        `/auth/verify-email?token=${token}`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al verificar el correo",
      );
    }
  },

  async forgotPassword(email: string, role: "user" | "admin") {
    try {
      const response = await api.post("/auth/forgot-password", { email, role });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Error al solicitar recuperación de contraseña",
      );
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al restablecer la contraseña",
      );
    }
  },

  setAuthToken(token: string) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  removeAuthToken() {
    delete api.defaults.headers.common["Authorization"];
  },

  async serverLogout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await api.post("/auth/logout", { refresh_token: refreshToken });
    } catch {
      // Ignorar errores — el token puede estar expirado
    }
  },

  async getSessions(): Promise<Session[]> {
    try {
      const response = await api.get<Session[]>("/auth/sessions");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error obteniendo sesiones",
      );
    }
  },

  async revokeSession(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(
        `/auth/sessions/${id}`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error cerrando la sesión",
      );
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>("/auth/me");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error obteniendo perfil",
      );
    }
  },
};

export default api;
