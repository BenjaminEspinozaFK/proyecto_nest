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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Edit,
  PhotoCamera,
  LocalGasStation,
  Add,
  AccountCircle,
  Settings,
  Logout,
  Notifications,
  Lock,
  Palette,
} from "@mui/icons-material";
import { useAuth } from "./AuthContext";
import { voucherService } from "../services/voucherService";
import { GasVoucher, VoucherStats } from "../types/voucher";
import { useSocket } from "../hooks/useSocket";

interface UserProfileProps {
  toggleTheme?: () => void;
  isDark?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ toggleTheme, isDark }) => {
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
    rut: "",
    address: "",
    phone: "",
    comuna: "",
  });

  // Estados para vales
  const [vouchers, setVouchers] = useState<GasVoucher[]>([]);
  const [voucherStats, setVoucherStats] = useState<VoucherStats | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestKilos, setRequestKilos] = useState(15);

  // Estados para menú de usuario
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const openMenu = Boolean(anchorEl);

  // Estados para configuración
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [voucherApprovedNotif, setVoucherApprovedNotif] = useState(true);
  const [voucherRejectedNotif, setVoucherRejectedNotif] = useState(true);
  const [voucherReadyNotif, setVoucherReadyNotif] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Socket.IO para actualizaciones en tiempo real (usuario)
  const socket = useSocket(user?.id, false);

  useEffect(() => {
    fetchProfile();
    fetchMyVouchers();
  }, []);

  // Escuchar eventos de Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleVoucherApproved = (voucher: GasVoucher) => {
      console.log("✅ Tu vale fue aprobado:", voucher);
      fetchMyVouchers(); // Recargar vales del usuario
    };

    const handleVoucherRejected = (voucher: GasVoucher) => {
      console.log("❌ Tu vale fue rechazado:", voucher);
      fetchMyVouchers();
    };

    const handleVoucherDelivered = (voucher: GasVoucher) => {
      console.log("📦 Tu vale fue marcado como entregado:", voucher);
      fetchMyVouchers();
    };

    socket.on("voucher:approved", handleVoucherApproved);
    socket.on("voucher:rejected", handleVoucherRejected);
    socket.on("voucher:delivered", handleVoucherDelivered);

    return () => {
      socket.off("voucher:approved", handleVoucherApproved);
      socket.off("voucher:rejected", handleVoucherRejected);
      socket.off("voucher:delivered", handleVoucherDelivered);
    };
  }, [socket]);

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
          rut: data.rut || "",
          address: data.address || "",
          phone: data.phone || "",
          comuna: data.comuna || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const [vouchersData, statsData] = await Promise.all([
        voucherService.getMyVouchers(),
        voucherService.getMyStats(),
      ]);
      setVouchers(vouchersData);
      setVoucherStats(statsData);
    } catch (error) {
      console.error("Error al cargar vales:", error);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleRequestVoucher = async () => {
    try {
      await voucherService.requestVoucher({ kilos: requestKilos });
      setSuccess(
        "Vale solicitado correctamente. Espera la aprobación del administrador."
      );
      setOpenRequestDialog(false);
      fetchMyVouchers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al solicitar el vale");
      console.error(error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");

      // No enviar el campo rut ya que no es modificable
      const { rut, ...updateData } = formData;

      const response = await fetch("http://localhost:3001/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = () => {
    handleSave();
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    setShowProfileModal(true);
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          py: 4,
          px: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const avatarSrc = profile?.avatar
    ? `http://localhost:3001${profile.avatar}`
    : undefined;

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
        {/* Header moderno con menú de usuario */}
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
              Dashboard de Usuario
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Gestiona tus vales de gas
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
                src={avatarSrc}
                sx={{
                  width: 48,
                  height: 48,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
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
                  {profile?.name || "Usuario"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                >
                  {profile?.email}
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

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
            {success}
          </Alert>
        )}

        {/* Sección principal: Mis Vales de Gas */}
        <Paper
          sx={{
            p: 4,
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <LocalGasStation sx={{ fontSize: 32, color: "#667eea" }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Mis Vales de Gas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestiona tus solicitudes de vales
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenRequestDialog(true)}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                },
              }}
            >
              Solicitar Vale
            </Button>
          </Box>

          {loadingVouchers ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Estadísticas */}
              {voucherStats && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(4, 1fr)",
                    },
                    gap: 3,
                    mb: 4,
                  }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      borderTop: "4px solid",
                      borderColor: "primary.main",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "primary.lighter",
                          color: "primary.main",
                        }}
                      >
                        <LocalGasStation />
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        mb: 0.5,
                      }}
                    >
                      {voucherStats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Solicitados
                    </Typography>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      borderTop: "4px solid",
                      borderColor: "warning.main",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "warning.lighter",
                          color: "warning.main",
                        }}
                      >
                        <LocalGasStation />
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        mb: 0.5,
                      }}
                    >
                      {voucherStats.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pendientes
                    </Typography>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      borderTop: "4px solid",
                      borderColor: "success.main",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "success.lighter",
                          color: "success.main",
                        }}
                      >
                        <LocalGasStation />
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        mb: 0.5,
                      }}
                    >
                      {voucherStats.delivered}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Entregados
                    </Typography>
                  </Paper>

                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: "16px",
                      borderTop: "4px solid",
                      borderColor: "info.main",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "info.lighter",
                          color: "info.main",
                        }}
                      >
                        <LocalGasStation />
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        mb: 0.5,
                      }}
                    >
                      ${voucherStats.totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Recibido
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Tabla de Vales */}
              {vouchers.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    px: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      mb: 3,
                    }}
                  >
                    <LocalGasStation sx={{ fontSize: 64, color: "#667eea" }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    No tienes vales solicitados
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Haz clic en 'Solicitar Vale' para comenzar a gestionar tus
                    vales de gas
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setOpenRequestDialog(true)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      },
                    }}
                  >
                    Solicitar Mi Primer Vale
                  </Button>
                </Box>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "rgba(102, 126, 234, 0.05)" }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Fecha Solicitud
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Kilos
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Monto
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Estado
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Notas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vouchers.map((voucher) => (
                        <TableRow
                          key={voucher.id}
                          sx={{
                            "&:hover": {
                              bgcolor: "rgba(102, 126, 234, 0.02)",
                            },
                          }}
                        >
                          <TableCell>
                            {new Date(voucher.requestDate).toLocaleDateString(
                              "es-ES"
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight={600}>
                              {voucher.kilos} kg
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {voucher.amount ? (
                              <Typography fontWeight={600} color="success.main">
                                ${voucher.amount.toLocaleString()}
                              </Typography>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                voucher.status === "pending"
                                  ? "PENDIENTE"
                                  : voucher.status === "approved"
                                    ? "APROBADO"
                                    : voucher.status === "rejected"
                                      ? "RECHAZADO"
                                      : "ENTREGADO"
                              }
                              size="small"
                              sx={{
                                bgcolor:
                                  voucher.status === "pending"
                                    ? "#f59e0b"
                                    : voucher.status === "approved"
                                      ? "#3b82f6"
                                      : voucher.status === "rejected"
                                        ? "#ef4444"
                                        : "#22c55e",
                                color: "#fff",
                                fontWeight: 600,
                                animation:
                                  voucher.status === "pending"
                                    ? "pulse 2s infinite"
                                    : "none",
                                "@keyframes pulse": {
                                  "0%, 100%": { opacity: 1 },
                                  "50%": { opacity: 0.7 },
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {voucher.notes || "-"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Paper>

        {/* Modal de Perfil */}
        {showProfileModal && (
          <Box
            onClick={() => setShowProfileModal(false)}
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
                maxWidth: 900,
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                p: 4,
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
                        border: "4px solid rgba(102, 126, 234, 0.2)",
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
                        bottom: 8,
                        right: 8,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "#ffffff !important",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                          transform: "scale(1.1)",
                        },
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.5)",
                        transition: "all 0.3s ease",
                        "& .MuiSvgIcon-root": {
                          color: "#ffffff",
                        },
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                      ) : (
                        <PhotoCamera sx={{ color: "#ffffff" }} />
                      )}
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
                  >
                    {profile?.role === "admin" ? "ADMINISTRADOR" : "USUARIO"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
                          borderRadius: "12px",
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Editar
                      </Button>
                    ) : (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              name: profile?.name || "",
                              email: profile?.email || "",
                              rut: profile?.rut || "",
                              address: profile?.address || "",
                              phone: profile?.phone || "",
                              comuna: profile?.comuna || "",
                            });
                          }}
                          sx={{ borderRadius: "12px", textTransform: "none" }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="contained"
                          disabled={saving}
                          onClick={handleUpdate}
                          sx={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "12px",
                            textTransform: "none",
                          }}
                        >
                          {saving ? <CircularProgress size={20} /> : "Guardar"}
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Box
                    component="form"
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 3,
                    }}
                  >
                    <TextField
                      label="Nombre completo"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editing}
                      fullWidth
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                      fullWidth
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        bgcolor: isDark
                          ? "rgba(102, 126, 234, 0.1)"
                          : "rgba(102, 126, 234, 0.05)",
                        border: `1px solid ${isDark ? "rgba(102, 126, 234, 0.3)" : "rgba(102, 126, 234, 0.2)"}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        RUT
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: isDark ? "#e0e0e0" : "#1a1a1a",
                        }}
                      >
                        {formData.rut || "No especificado"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          mt: 0.5,
                        }}
                      >
                        El RUT no puede ser modificado
                      </Typography>
                    </Box>
                    <TextField
                      label="Dirección"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                    <TextField
                      label="Teléfono"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                    <TextField
                      label="Comuna"
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleChange}
                      disabled={!editing}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
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
                        Configuración
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Personaliza tu experiencia
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

                {/* Sección: Notificaciones */}
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
                      Notificaciones
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
                            Recibe actualizaciones importantes por correo
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={voucherApprovedNotif}
                          onChange={(e) =>
                            setVoucherApprovedNotif(e.target.checked)
                          }
                          color="primary"
                          disabled={!emailNotifications}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            Vale Aprobado
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Notificarme cuando un vale sea aprobado
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0, ml: 4 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={voucherRejectedNotif}
                          onChange={(e) =>
                            setVoucherRejectedNotif(e.target.checked)
                          }
                          color="primary"
                          disabled={!emailNotifications}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            Vale Rechazado
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Notificarme cuando un vale sea rechazado
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0, ml: 4 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={voucherReadyNotif}
                          onChange={(e) =>
                            setVoucherReadyNotif(e.target.checked)
                          }
                          color="primary"
                          disabled={!emailNotifications}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="500">
                            Vale Listo para Retiro
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Notificarme cuando un vale esté entregado
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

        {/* Dialog para solicitar vale */}
        <Dialog
          open={openRequestDialog}
          onClose={() => setOpenRequestDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: "20px",
              minWidth: 400,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Solicitar Vale de Gas
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Cantidad de Kilos</InputLabel>
                <Select
                  value={requestKilos}
                  label="Cantidad de Kilos"
                  onChange={(e) => setRequestKilos(Number(e.target.value))}
                  sx={{ borderRadius: "12px" }}
                >
                  <MenuItem value={15}>15 kg</MenuItem>
                  <MenuItem value={45}>45 kg</MenuItem>
                </Select>
              </FormControl>
              <Alert severity="info" sx={{ mt: 2, borderRadius: "12px" }}>
                Tu solicitud será revisada por un administrador. Te
                notificaremos cuando sea aprobada.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenRequestDialog(false)}
              sx={{ borderRadius: "12px", textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRequestVoucher}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Solicitar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserProfile;
