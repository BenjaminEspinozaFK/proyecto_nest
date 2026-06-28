import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthContextType,
  AuthResponse,
  User,
  RegisterRequest,
} from "../types/auth";
import { authService } from "../services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateAndRestoreSession = async () => {
      const savedToken = localStorage.getItem("authToken");
      if (savedToken) {
        try {
          // Validar que el token siga siendo válido haciendo una petición al backend
          authService.setAuthToken(savedToken);
          const profile = await authService.getProfile();

          // Token válido, restaurar sesión
          setToken(savedToken);
          setUser(profile);
          localStorage.setItem("authUser", JSON.stringify(profile));
        } catch (error) {
          // Error de red o backend, limpiar sesión por seguridad
          console.error("Error validando token, limpiando sesión:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
          authService.removeAuthToken();
        }
      }
    };

    validateAndRestoreSession();
  }, []);

  const login = async (
    email: string,
    password: string,
    role: string,
  ): Promise<{ requires2FA?: boolean }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login({ email, password, role });

      if ("requires2FA" in response && response.requires2FA) {
        return { requires2FA: true };
      }

      const authResponse = response as AuthResponse;
      setToken(authResponse.access_token);
      setUser(authResponse.user);

      localStorage.setItem("authToken", authResponse.access_token);
      localStorage.setItem("authUser", JSON.stringify(authResponse.user));

      authService.setAuthToken(authResponse.access_token);
      return {};
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWith2FA = async (
    email: string,
    password: string,
    role: string,
    code: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.loginWith2FA({
        email,
        password,
        role,
        code,
      });

      setToken(response.access_token);
      setUser(response.user);

      localStorage.setItem("authToken", response.access_token);
      localStorage.setItem("authUser", JSON.stringify(response.user));

      authService.setAuthToken(response.access_token);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(data);

      return response.message;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);

    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    authService.removeAuthToken();
  };
  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    setUser,
    login,
    loginWith2FA,
    register,
    logout,
    updateUserAvatar,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
