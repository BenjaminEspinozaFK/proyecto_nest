import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Edit, Save, Cancel, PhotoCamera } from "@mui/icons-material";
import { adminService } from "../../services/adminService";

interface AdminProfileData {
  id: string;
  email: string;
  name: string;
  rut: string;
  role: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
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
    rut: "",
    password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await adminService.getMyProfile();
      setProfile(data);
      setFormData({
        name: data.name || "",
        email: data.email,
        rut: data.rut,
        password: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email,
        rut: profile.rut,
        password: "",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        rut: formData.rut,
      };

      // Solo incluir password si se proporcionó
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      await adminService.updateMyProfile(updateData);
      setSuccess("Perfil actualizado correctamente");
      setEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/admins/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir imagen");

      await response.json();
      setSuccess("Foto actualizada correctamente");
      fetchProfile();
    } catch (err) {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return <Typography color="error">Error al cargar el perfil</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" mb={3}>
        👤 Mi Perfil
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 3,
        }}
      >
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
          }}
        >
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <Avatar
              src={
                profile.avatar
                  ? `http://localhost:3001${profile.avatar}`
                  : undefined
              }
              sx={{
                width: 150,
                height: 150,
                margin: "0 auto",
                mb: 2,
                fontSize: 60,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {profile.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{
                position: "absolute",
                bottom: 16,
                right: -8,
                boxShadow: 3,
              }}
            >
              <PhotoCamera />
            </IconButton>
          </Box>
          {uploading && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Subiendo imagen...
            </Typography>
          )}
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {profile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {profile.role.toUpperCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Miembro desde: {new Date(profile.createdAt).toLocaleDateString()}
          </Typography>
          {profile.lastLogin && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Último login: {new Date(profile.lastLogin).toLocaleString()}
            </Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight="bold">
              Información Personal
            </Typography>
            {!editing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Editar
              </Button>
            ) : (
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  sx={{ mr: 1 }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </Box>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!editing}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!editing}
            />

            <TextField
              fullWidth
              label="RUT"
              type="text"
              value={formData.rut}
              onChange={(e) =>
                setFormData({ ...formData, rut: e.target.value })
              }
              disabled={!editing}
              placeholder="12345678-9"
            />

            {editing && (
              <TextField
                fullWidth
                label="Nueva Contraseña (dejar vacío para no cambiar)"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminProfile;
