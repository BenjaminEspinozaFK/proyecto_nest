import React, { useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import AdminDashboard from "./AdminDashboard";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Fade,
} from "@mui/material";
import {
  LogoutOutlined,
  Person,
  Email,
  Cake,
  AdminPanelSettings,
  PhotoCamera,
  CalendarToday,
  AccountCircle,
  Shield,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";

interface DashboardProps {
  toggleTheme: () => void;
  isDark: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleTheme, isDark }) => {
  const { user, logout, updateUserAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return null;
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("authToken");

      // Detectar si es admin o user y usar el endpoint correcto
      const endpoint =
        user.role === "admin"
          ? "http://localhost:3001/admins/me/avatar"
          : "http://localhost:3001/users/me/avatar";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir imagen");

      const data = await response.json();
      updateUserAvatar(data.avatar);
    } catch (err) {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const avatarSrc = user.avatar
    ? `http://localhost:3001${user.avatar}`
    : undefined;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            {/* Header con saludo y logout */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "600",
                    fontSize: { xs: "2rem", sm: "3rem" },
                  }}
                >
                  ¡Hola, {user.name?.split(" ")[0]}! 👋
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Bienvenido a tu panel de control
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{ color: "text.secondary" }}
                >
                  {isDark ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
                <Button
                  variant="contained"
                  onClick={logout}
                  startIcon={<LogoutOutlined />}
                >
                  Cerrar Sesión
                </Button>
              </Box>
            </Box>

            {/* Card principal con perfil */}
            <Card
              sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "350px 1fr" },
                    gap: 4,
                  }}
                >
                  {/* Columna izquierda - Avatar */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={avatarSrc}
                        sx={{
                          width: 160,
                          height: 160,
                          fontSize: 48,
                          bgcolor: "primary.main",
                        }}
                      >
                        {initials}
                      </Avatar>

                      <IconButton
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        sx={{
                          position: "absolute",
                          bottom: 5,
                          right: 5,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          width: 48,
                          height: 48,
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        }}
                      >
                        {uploading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <PhotoCamera />
                        )}
                      </IconButton>

                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </Box>

                    <Chip
                      icon={
                        user.role === "admin" ? (
                          <AdminPanelSettings />
                        ) : (
                          <Person />
                        )
                      }
                      label={
                        user.role === "admin" ? "Administrador" : "Usuario"
                      }
                      color={user.role === "admin" ? "warning" : "primary"}
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        px: 1,
                        py: 2.5,
                      }}
                    />
                  </Box>

                  {/* Columna derecha - Información */}
                  <Box>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color="primary"
                          gutterBottom
                        >
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Miembro desde {new Date().toLocaleDateString("es-ES")}
                        </Typography>
                      </Box>

                      <Divider />

                      {/* Información del perfil */}
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "rgba(102, 126, 234, 0.08)",
                          }}
                        >
                          <Email color="primary" />
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Correo electrónico
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "rgba(118, 75, 162, 0.08)",
                          }}
                        >
                          <Cake color="secondary" />
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Edad
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {user.age} años
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>

                      {error && (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                          {error}
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Cards de información útil */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 3,
                mb: 3,
              }}
            >
              {/* Card de Perfil */}
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <AccountCircle sx={{ fontSize: 48 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Mi Perfil
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, mt: 0.5 }}
                      >
                        {user.role === "admin" ? "Administrador" : "Usuario"}{" "}
                        del sistema
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Card de Fecha de registro */}
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(240, 147, 251, 0.4)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CalendarToday sx={{ fontSize: 48 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Miembro desde
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, mt: 0.5 }}
                      >
                        {new Date().toLocaleDateString("es-ES", {
                          month: "long",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Card de Seguridad */}
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  color: "white",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(67, 233, 123, 0.4)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Shield sx={{ fontSize: 48 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Cuenta Segura
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, mt: 0.5 }}
                      >
                        Protegida y encriptada
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Panel de administrador */}
            {user.role === "admin" && (
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  background: "rgba(40, 40, 40, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <AdminPanelSettings
                      sx={{ fontSize: 40, color: "warning.main" }}
                    />
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="#ffffff"
                      >
                        Panel de Administración
                      </Typography>
                      <Typography
                        variant="body2"
                        color="rgba(255, 255, 255, 0.7)"
                      >
                        Gestión de usuarios del sistema
                      </Typography>
                    </Box>
                  </Box>
                  <Divider
                    sx={{ mb: 3, borderColor: "rgba(255, 255, 255, 0.1)" }}
                  />
                  <AdminDashboard />
                </CardContent>
              </Card>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Dashboard;
