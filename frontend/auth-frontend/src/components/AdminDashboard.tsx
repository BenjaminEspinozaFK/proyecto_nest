import React, { useEffect, useState } from "react";
import { User } from "../types/auth"; // Ajusta la ruta si es necesario
import {
  Box,
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Tabs,
  Tab,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  People,
  Receipt,
  BarChart,
  AccountCircle,
  Settings,
  Logout,
  Add,
  Notifications,
  Lock,
  Palette,
  Search,
} from "@mui/icons-material";
import UserDetailModal from "./admin/UserDetailModal";
import AdminStats from "./admin/Stats";
import AdminProfile from "./admin/Profile";
import CreateUserModal from "./admin/CreateUserModal";
import VoucherRequests from "./admin/VoucherRequests";

interface AdminDashboardProps {
  toggleTheme?: () => void;
  isDark?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  toggleTheme,
  isDark,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const openMenu = Boolean(anchorEl);

  // Estados para configuración
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [userCreatedNotif, setUserCreatedNotif] = useState(true);
  const [voucherRequestNotif, setVoucherRequestNotif] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/admins/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAdminProfile(data);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch("http://localhost:3001/admins/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched users:", data); // Para debug
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleCreated = () => {
    // Después de crear, refrescar la lista
    fetchUsers();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    setShowProfile(true);
    handleMenuClose();
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
    handleMenuClose();
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son obligatorios");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:3001/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setPasswordError(errorData.message || "Error al cambiar la contraseña");
        return;
      }

      setPasswordSuccess("Contraseña cambiada correctamente");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError("Error al cambiar la contraseña");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        py: 4,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header con título y menú de usuario */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            pb: 3,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 0.5,
              }}
            >
              Panel de Administración
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Gestiona usuarios y solicitudes de vales
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {adminProfile?.role === "admin" && tabValue === 0 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreate}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                Crear Usuario
              </Button>
            )}

            {/* Avatar con menú desplegable */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0,
                border: "3px solid transparent",
                background:
                  "linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box",
                borderRadius: "50%",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                src={
                  adminProfile?.avatar
                    ? `http://localhost:3001${adminProfile.avatar}`
                    : undefined
                }
                sx={{
                  width: 48,
                  height: 48,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {adminProfile?.name
                  ? adminProfile.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : "AD"}
              </Avatar>
            </IconButton>

            {/* Menú desplegable */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                  mt: 1.5,
                  borderRadius: "12px",
                  minWidth: 220,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {adminProfile?.name || "Admin"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                >
                  {adminProfile?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleViewProfile}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mi Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleOpenSettings}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Configuración</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "error.main",
                  "&:hover": {
                    backgroundColor: "error.lighter",
                  },
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "error.main" }} />
                </ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Paper
          sx={{
            mb: 3,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                minHeight: 64,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.08)",
                },
              },
              "& .Mui-selected": {
                color: "#667eea !important",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
            }}
          >
            <Tab icon={<People />} iconPosition="start" label="Usuarios" />
            <Tab
              icon={<Receipt />}
              iconPosition="start"
              label="Solicitudes de Vales"
            />
            <Tab
              icon={<BarChart />}
              iconPosition="start"
              label="Estadísticas"
            />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Buscar usuario por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": {
                      borderColor: "#667eea",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                    },
                  },
                }}
              />
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>RUT</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .filter((user) => {
                      const normalizeText = (text: string) =>
                        text
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "");
                      return normalizeText(user.name).includes(
                        normalizeText(searchTerm)
                      );
                    })
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.rut}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenDetailModal(true);
                            }}
                          >
                            Ver Perfil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Botón movido al header */}

            <CreateUserModal
              open={createOpen}
              onClose={() => setCreateOpen(false)}
              onCreated={handleCreated}
            />

            <UserDetailModal
              open={openDetailModal}
              onClose={() => {
                setOpenDetailModal(false);
                setSelectedUser(null);
              }}
              user={selectedUser}
              onUpdate={fetchUsers}
            />
          </>
        )}

        {tabValue === 1 && <VoucherRequests />}

        {tabValue === 2 && <AdminStats />}

        {/* Modal de perfil */}
        {showProfile && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1300,
            }}
            onClick={() => setShowProfile(false)}
          >
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: "20px",
                maxWidth: "800px",
                width: "90%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AdminProfile />
            </Box>
          </Box>
        )}

        {/* Modal de Configuración */}
        {showSettingsModal && (
          <Box
            onClick={() => setShowSettingsModal(false)}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              p: 3,
            }}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                bgcolor: "background.paper",
                borderRadius: "20px",
                maxWidth: 800,
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Paper
                sx={{
                  p: 4,
                  borderRadius: "20px",
                  boxShadow: "none",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                      }}
                    >
                      <Settings sx={{ fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        Configuración del Sistema
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administra preferencias y seguridad
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => setShowSettingsModal(false)}
                    sx={{
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    ✕
                  </IconButton>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Sección: Cambiar Contraseña */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Lock sx={{ color: "primary.main" }} />
                    <Typography variant="h6" fontWeight="600">
                      Cambiar Contraseña
                    </Typography>
                  </Box>

                  {passwordError && (
                    <Alert
                      severity="error"
                      sx={{ mb: 2, borderRadius: "12px" }}
                    >
                      {passwordError}
                    </Alert>
                  )}

                  {passwordSuccess && (
                    <Alert
                      severity="success"
                      sx={{ mb: 2, borderRadius: "12px" }}
                    >
                      {passwordSuccess}
                    </Alert>
                  )}

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Contraseña Actual"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                    <TextField
                      label="Nueva Contraseña"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                    <TextField
                      label="Confirmar Nueva Contraseña"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1.5,
                      }}
                    >
                      {changingPassword ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Cambiar Contraseña"
                      )}
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Sección: Notificaciones del Sistema */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Notifications sx={{ color: "primary.main" }} />
                    <Typography variant="h6" fontWeight="600">
                      Notificaciones del Sistema
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emailNotifications}
                          onChange={(e) =>
                            setEmailNotifications(e.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            Notificaciones por Email
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Recibe alertas importantes del sistema por correo
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemAlerts}
                          onChange={(e) => setSystemAlerts(e.target.checked)}
                          color="primary"
                          disabled={!emailNotifications}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            Alertas del Sistema
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Notificarme sobre errores o problemas del sistema
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0, ml: 4 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={userCreatedNotif}
                          onChange={(e) =>
                            setUserCreatedNotif(e.target.checked)
                          }
                          color="primary"
                          disabled={!emailNotifications}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            Nuevo Usuario Registrado
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Notificarme cuando se registre un nuevo usuario
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0, ml: 4 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={voucherRequestNotif}
                          onChange={(e) =>
                            setVoucherRequestNotif(e.target.checked)
                          }
                          color="primary"
                          disabled={!emailNotifications}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            Nueva Solicitud de Vale
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Notificarme cuando un usuario solicite un vale
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0, ml: 4 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Sección: Apariencia */}
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Palette sx={{ color: "primary.main" }} />
                    <Typography variant="h6" fontWeight="600">
                      Apariencia
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={isDark}
                        onChange={toggleTheme}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          Tema Oscuro
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Activa el modo oscuro para reducir la fatiga visual
                        </Typography>
                      </Box>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setShowSettingsModal(false)}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Cerrar
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
