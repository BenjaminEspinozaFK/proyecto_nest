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
  Paper,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";

const Dashboard: React.FC = () => {
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
      const response = await fetch("http://localhost:3001/users/me/avatar", {
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
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card sx={{ maxWidth: 1200, width: "100%", padding: 2, boxShadow: 4 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
              paddingBottom: 1,
              borderBottom: "2px solid #f0f0f0",
            }}
          >
            <Typography variant="h4" component="h2">
              ¡Bienvenido!
            </Typography>
            <Button variant="contained" color="error" onClick={logout}>
              Cerrar Sesión
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={avatarSrc}
                sx={{ width: 100, height: 100, fontSize: 32 }}
              >
                {initials}
              </Avatar>

              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{
                  position: "absolute",
                  bottom: -5,
                  right: -5,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                {uploading ? (
                  <CircularProgress size={16} />
                ) : (
                  <EditIcon fontSize="small" />
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

            <Box sx={{ flex: 1 }}>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h5">{user.name}</Typography>
                  <Chip
                    label={user.role}
                    color={user.role === "admin" ? "warning" : "primary"}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Edad:</strong> {user.age} años
                </Typography>
              </Stack>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
              gap: 2,
            }}
          >
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" color="success.main">
                ✅ Conectado
              </Typography>
              <Typography variant="body2">Autenticación JWT</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">Perfil</Typography>
              <Typography variant="body2">
                Completo al {user.avatar ? "100" : "80"}%
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadIcon />}
              >
                Editar Perfil
              </Button>
            </Paper>
          </Box>

          {user.role === "admin" && (
            <>
              <Divider sx={{ my: 3 }} />
              <AdminDashboard />
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;
