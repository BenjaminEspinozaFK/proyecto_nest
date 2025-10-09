import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthContextType, User, RegisterRequest } from "../types/auth";
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
    // Verificar si hay un token guardado en localStorage
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("authUser");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      authService.setAuthToken(savedToken);
    }
  }, []);

  const login = async (email: string, password: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login({ email, password, role });

      setToken(response.access_token);
      setUser(response.user);

      // Guardar en localStorage
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

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(data);

      setToken(response.access_token);
      setUser(response.user);

      // Guardar en localStorage
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

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);

    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    authService.removeAuthToken();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
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
