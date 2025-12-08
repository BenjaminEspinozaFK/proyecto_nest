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
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  LocalGasStation,
  Add,
} from "@mui/icons-material";
import { useAuth } from "./AuthContext";
import { voucherService } from "../services/voucherService";
import { GasVoucher, VoucherStats } from "../types/voucher";
import { useSocket } from "../hooks/useSocket";

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
    rut: "",
  });

  // Estados para vales
  const [vouchers, setVouchers] = useState<GasVoucher[]>([]);
  const [voucherStats, setVoucherStats] = useState<VoucherStats | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestKilos, setRequestKilos] = useState(15);

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

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      rut: profile?.rut || "",
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
                label="RUT"
                type="text"
                value={profile?.rut || ""}
                disabled={true}
                variant="filled"
                placeholder="12345678-9"
                helperText="El RUT no puede ser modificado"
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

        <Divider sx={{ my: 4 }} />

        {/* Sección de Vales de Gas */}
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
              <LocalGasStation sx={{ mr: 1, verticalAlign: "middle" }} />
              Mis Vales de Gas
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenRequestDialog(true)}
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
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {voucherStats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Solicitados
                    </Typography>
                  </Paper>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "warning.main",
                      color: "white",
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      {voucherStats.pending}
                    </Typography>
                    <Typography variant="body2">Pendientes</Typography>
                  </Paper>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "success.main",
                      color: "white",
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold">
                      {voucherStats.delivered}
                    </Typography>
                    <Typography variant="body2">Entregados</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
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
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No tienes vales solicitados. Haz clic en "Solicitar Vale"
                    para comenzar.
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha Solicitud</TableCell>
                        <TableCell align="center">Kilos</TableCell>
                        <TableCell align="center">Monto</TableCell>
                        <TableCell align="center">Estado</TableCell>
                        <TableCell>Notas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell>
                            {new Date(voucher.requestDate).toLocaleDateString(
                              "es-ES"
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {voucher.kilos} kg
                          </TableCell>
                          <TableCell align="center">
                            {voucher.amount
                              ? `$${voucher.amount.toLocaleString()}`
                              : "-"}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                voucher.status === "pending"
                                  ? "Pendiente"
                                  : voucher.status === "approved"
                                    ? "Aprobado"
                                    : voucher.status === "rejected"
                                      ? "Rechazado"
                                      : "Entregado"
                              }
                              size="small"
                              color={
                                voucher.status === "pending"
                                  ? "warning"
                                  : voucher.status === "approved"
                                    ? "info"
                                    : voucher.status === "rejected"
                                      ? "error"
                                      : "success"
                              }
                            />
                          </TableCell>
                          <TableCell>{voucher.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Box>

        {/* Dialog para solicitar vale */}
        <Dialog
          open={openRequestDialog}
          onClose={() => setOpenRequestDialog(false)}
        >
          <DialogTitle>Solicitar Vale de Gas</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, minWidth: 300 }}>
              <FormControl fullWidth>
                <InputLabel>Cantidad de Kilos</InputLabel>
                <Select
                  value={requestKilos}
                  label="Cantidad de Kilos"
                  onChange={(e) => setRequestKilos(Number(e.target.value))}
                >
                  <MenuItem value={15}>15 kg</MenuItem>
                  <MenuItem value={45}>45 kg</MenuItem>
                </Select>
              </FormControl>
              <Alert severity="info" sx={{ mt: 2 }}>
                Tu solicitud será revisada por un administrador. Te
                notificaremos cuando sea aprobada.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRequestDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestVoucher} variant="contained">
              Solicitar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UserProfile;
