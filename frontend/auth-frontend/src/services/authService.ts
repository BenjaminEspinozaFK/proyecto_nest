import axios from "axios";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";

const API_BASE_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.warn("Token inválido (401), limpiando sesión");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      delete api.defaults.headers.common["Authorization"];

      // Recargar la página para forzar logout
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error en el login");
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error en el registro");
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
        error.response?.data?.message || "Error obteniendo perfil"
      );
    }
  },
};

export default api;
