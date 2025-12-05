/**
 * Helper para hacer peticiones fetch con token de autenticación
 * Maneja automáticamente tokens expirados y redirige al login
 */

const API_BASE_URL = "http://localhost:3001";

export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem("authToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Si el token expiró (401), limpiar sesión y redirigir
    if (response.status === 401) {
      console.warn("Token expirado (401), limpiando sesión");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    return response;
  } catch (error) {
    // Si es un error de red o el servidor no responde
    if (error instanceof TypeError) {
      throw new Error("Error de conexión con el servidor");
    }
    throw error;
  }
};

/**
 * Helper para hacer peticiones fetch con FormData (para archivos)
 */
export const authFetchFormData = async (
  url: string,
  formData: FormData,
  method: string = "POST"
): Promise<Response> => {
  const token = localStorage.getItem("authToken");

  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // NO establecer Content-Type para FormData, el navegador lo hace automáticamente

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers,
      body: formData,
    });

    if (response.status === 401) {
      console.warn("Token expirado (401), limpiando sesión");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Error de conexión con el servidor");
    }
    throw error;
  }
};
