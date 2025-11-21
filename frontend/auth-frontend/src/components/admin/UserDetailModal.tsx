import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  Alert,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Close,
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  Cake,
  AdminPanelSettings,
  CalendarToday,
  Login,
} from "@mui/icons-material";
import { User } from "../../types/auth";

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  open,
  onClose,
  user,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      setEditedUser(user);
      setIsEditing(false);
      setError(null);
      setSuccess(null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!editedUser) return;

    try {
      const token = localStorage.getItem("authToken");

      const userDataToUpdate = {
        email: editedUser.email,
        name: editedUser.name,
        age: editedUser.age,
        role: editedUser.role,
      };

      const response = await fetch(
        `http://localhost:3001/admins/users/${editedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userDataToUpdate),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join("\n")
          : errorData.message || "No se pudo actualizar el usuario";
        setError(errorMessage);
        return;
      }

      setSuccess("Usuario actualizado correctamente");
      setIsEditing(false);
      setError(null);
      onUpdate();

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setError("Error al guardar los cambios");
    }
  };

  const handleDelete = async () => {
    if (!editedUser) return;

    if (
      window.confirm(`¿Estás seguro de eliminar al usuario ${editedUser.name}?`)
    ) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:3001/admins/users/${editedUser.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          setSuccess("Usuario eliminado correctamente");
          onUpdate();
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError("Error al eliminar el usuario");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        setError("Error al eliminar el usuario");
      }
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!editedUser) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 600, md: 700 },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#282828" : "#ffffff",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          borderRadius: 3,
          border: (theme) =>
            `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <Close />
          </IconButton>

          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              src={
                editedUser.avatar
                  ? `http://localhost:3001${editedUser.avatar}`
                  : undefined
              }
              sx={{
                width: 80,
                height: 80,
                border: "3px solid white",
                fontSize: "2rem",
              }}
            >
              {editedUser.name
                ? editedUser.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {editedUser.name || "Usuario"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {editedUser.email}
              </Typography>
              <Chip
                label={
                  editedUser.role === "admin" ? "Administrador" : "Usuario"
                }
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ m: 2 }}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Información" />
            <Tab label="Actividad" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  Datos del Usuario
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      color="primary"
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setIsEditing(false);
                        setEditedUser(user);
                        setError(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  value={editedUser.name || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, name: e.target.value })
                  }
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <Person sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  value={editedUser.email || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <Email sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <TextField
                    sx={{ flex: 1, minWidth: "200px" }}
                    label="Edad"
                    type="number"
                    value={editedUser.age || ""}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        age: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <Cake sx={{ mr: 1, color: "action.active" }} />
                      ),
                    }}
                  />

                  <FormControl
                    sx={{ flex: 1, minWidth: "200px" }}
                    disabled={!isEditing}
                  >
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={editedUser.role || "user"}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, role: e.target.value })
                      }
                      startAdornment={
                        <AdminPanelSettings
                          sx={{ mr: 1, color: "action.active" }}
                        />
                      }
                    >
                      <MenuItem value="user">Usuario</MenuItem>
                      <MenuItem value="admin">Administrador</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Información del Sistema
              </Typography>

              <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: "250px",
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Fecha de Registro
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="500">
                    {formatDate(editedUser.createdAt)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: "250px",
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Login fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Último Inicio de Sesión
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="500">
                    {formatDate(editedUser.lastLogin)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Actividad Reciente
              </Typography>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "background.default",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary">
                  Historial de actividad próximamente...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Eliminar Usuario
          </Button>
          <Button variant="contained" onClick={onClose}>
            Cerrar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserDetailModal;
