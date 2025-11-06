import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { adminService } from "../../services/adminService";

interface AdminProfileData {
  id: string;
  email: string;
  name: string;
  age: number;
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: 0,
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
        age: data.age,
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
        age: profile.age,
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
        age: formData.age,
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
            backgroundColor: "rgba(50, 50, 50, 0.5)",
            textAlign: "center",
          }}
        >
          <Avatar
            src={profile.avatar || undefined}
            sx={{
              width: 150,
              height: 150,
              margin: "0 auto",
              mb: 2,
              fontSize: 60,
            }}
          >
            {profile.name?.charAt(0).toUpperCase()}
          </Avatar>
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

        <Paper sx={{ p: 3, backgroundColor: "rgba(50, 50, 50, 0.5)" }}>
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
                sx={{
                  "& .MuiInputBase-root": { color: "#ffffff" },
                  "& .MuiInputLabel-root": { color: "#ffffff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  },
                }}
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
                sx={{
                  "& .MuiInputBase-root": { color: "#ffffff" },
                  "& .MuiInputLabel-root": { color: "#ffffff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Edad"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: parseInt(e.target.value) })
                }
                disabled={!editing}
                sx={{
                  "& .MuiInputBase-root": { color: "#ffffff" },
                  "& .MuiInputLabel-root": { color: "#ffffff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                  },
                }}
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
                  sx={{
                    "& .MuiInputBase-root": { color: "#ffffff" },
                    "& .MuiInputLabel-root": { color: "#ffffff" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                    },
                  }}
                />
              )}
            </Box>
          </Paper>
      </Box>
    </Box>
  );
};

export default AdminProfile;
