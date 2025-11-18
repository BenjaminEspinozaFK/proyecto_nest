import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
} from "@mui/material";
import { Edit, Save, Cancel, PhotoCamera } from "@mui/icons-material";
import { useAuth } from "./AuthContext";

const UserProfile: React.FC = () => {
  const { user, updateUserAvatar } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          age: data.age || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join("\n")
          : errorData.message || "Error al actualizar el perfil";
        setError(errorMessage);
        return;
      }

      const updatedData = await response.json();
      setProfile(updatedData);
      setSuccess("Perfil actualizado correctamente");
      setEditing(false);

      // Actualizar el contexto de autenticación
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      setError("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      age: profile?.age || 0,
    });
    setEditing(false);
    setError(null);
  };

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
      setProfile({ ...profile, avatar: data.avatar });
      setSuccess("Avatar actualizado correctamente");
    } catch (err) {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("La imagen no puede ser mayor a 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten archivos de imagen");
        return;
      }
      handleImageUpload(file);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const avatarSrc = profile?.avatar
    ? `http://localhost:3001${profile.avatar}`
    : undefined;

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        👤 Mi Perfil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
            gap: 4,
          }}
        >
          {/* Avatar Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Box sx={{ position: "relative", mb: 3 }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 150,
                  height: 150,
                  fontSize: 60,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "4px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {profile?.name
                  ? profile.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </Avatar>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
              />

              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: "absolute",
                  bottom: 16,
                  right: -8,
                  boxShadow: 3,
                }}
              >
                {uploading ? <CircularProgress size={20} /> : <PhotoCamera />}
              </IconButton>
            </Box>

            {uploading && (
              <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                Subiendo imagen...
              </Typography>
            )}

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {profile?.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              {profile?.role === "admin" ? "ADMINISTRADOR" : "USUARIO"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              Último acceso:{" "}
              {profile?.lastLogin
                ? new Date(profile.lastLogin).toLocaleDateString("es-ES")
                : "Nunca"}
            </Typography>
          </Box>

          {/* Profile Form */}
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Información Personal
              </Typography>

              {!editing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    },
                  }}
                >
                  Editar
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={editing ? formData.name : profile?.name || ""}
                onChange={(e) =>
                  editing && setFormData({ ...formData, name: e.target.value })
                }
                disabled={!editing}
                variant={editing ? "outlined" : "filled"}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editing ? formData.email : profile?.email || ""}
                onChange={(e) =>
                  editing && setFormData({ ...formData, email: e.target.value })
                }
                disabled={!editing}
                variant={editing ? "outlined" : "filled"}
              />

              <TextField
                fullWidth
                label="Edad"
                type="number"
                value={editing ? formData.age : profile?.age || ""}
                onChange={(e) =>
                  editing &&
                  setFormData({
                    ...formData,
                    age: parseInt(e.target.value) || 0,
                  })
                }
                disabled={!editing}
                variant={editing ? "outlined" : "filled"}
              />

              <TextField
                fullWidth
                label="Rol"
                value={profile?.role === "admin" ? "Administrador" : "Usuario"}
                disabled
                variant="filled"
              />

              <TextField
                fullWidth
                label="Fecha de Registro"
                value={
                  profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Desconocido"
                }
                disabled
                variant="filled"
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserProfile;
