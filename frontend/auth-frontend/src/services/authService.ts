import axios from "axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
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

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo recargar la página si NO es un intento de login o registro
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register") ||
        error.config?.url?.includes("/auth/2fa/");

      if (!isAuthEndpoint) {
        // Token expirado o inválido
        console.warn("Token inválido (401), limpiando sesión");
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        delete api.defaults.headers.common["Authorization"];

        // Recargar la página para forzar logout
        window.location.href = "/";
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
