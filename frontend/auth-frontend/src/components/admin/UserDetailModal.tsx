import React, { useState, useEffect, useCallback } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  Cake,
  AdminPanelSettings,
  CalendarToday,
  Login,
  LocalGasStation,
  AttachMoney,
  Add,
  Delete,
} from "@mui/icons-material";
import { User } from "../../types/auth";
import { GasVoucher, VoucherStats } from "../../types/voucher";
import { voucherService } from "../../services/voucherService";
import {
  monthlyPaymentsService,
  MonthlyPayment,
  PaymentSummary,
} from "../../services/monthlyPaymentsService";

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
  const [tabValue, setTabValue] = useState<number>(0);

  // Estados para vales
  const [vouchers, setVouchers] = useState<GasVoucher[]>([]);
  const [voucherStats, setVoucherStats] = useState<VoucherStats | null>(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Estados para pagos mensuales
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    amount: 0,
    description: "",
  });

  const fetchVouchers = useCallback(async () => {
    if (!user) return;

    setLoadingVouchers(true);
    try {
      const [vouchersData, statsData] = await Promise.all([
        voucherService.getUserVouchers(user.id),
        voucherService.getUserStats(user.id),
      ]);
      setVouchers(vouchersData);
      setVoucherStats(statsData);
    } catch (error) {
      console.error("Error al cargar vales:", error);
    } finally {
      setLoadingVouchers(false);
    }
  }, [user]);

  const fetchPayments = useCallback(async () => {
    if (!user) return;

    setLoadingPayments(true);
    try {
      const [paymentsData, summaryData] = await Promise.all([
        monthlyPaymentsService.getUserPayments(user.id),
        monthlyPaymentsService.getPaymentSummary(user.id),
      ]);
      setPayments(paymentsData);
      setPaymentSummary(summaryData);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setLoadingPayments(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditedUser(user);
      setIsEditing(false);
      setError(null);
      setSuccess(null);
      setTabValue(0);

      // Cargar vales y pagos cuando se abre el modal
      if (open) {
        fetchVouchers();
        fetchPayments();
      }
    }
  }, [user, open, fetchVouchers, fetchPayments]);

  const handleApproveVoucher = async (voucherId: string) => {
    const amount = prompt("Ingrese el monto del vale (en pesos):");
    if (!amount) return;

    const notes = prompt("Notas (opcional):");

    try {
      await voucherService.approveVoucher(voucherId, {
        amount: parseFloat(amount),
        notes: notes || undefined,
      });
      setSuccess("Vale aprobado correctamente");
      fetchVouchers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al aprobar el vale");
      console.error(error);
    }
  };

  const handleRejectVoucher = async (voucherId: string) => {
    const notes = prompt("Razón del rechazo (opcional):");

    try {
      await voucherService.rejectVoucher(voucherId, {
        notes: notes || undefined,
      });
      setSuccess("Vale rechazado");
      fetchVouchers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al rechazar el vale");
      console.error(error);
    }
  };

  const handleMarkDelivered = async (voucherId: string) => {
    if (
      !window.confirm("¿Confirmar que el vale fue entregado al funcionario?")
    ) {
      return;
    }

    try {
      await voucherService.markAsDelivered(voucherId);
      setSuccess("Vale marcado como entregado");
      fetchVouchers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al marcar como entregado");
      console.error(error);
    }
  };

  // Funciones para manejar pagos mensuales
  const handleAddPayment = async () => {
    if (!user) return;
    if (newPayment.amount <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    try {
      await monthlyPaymentsService.createPayment(
        user.id,
        newPayment.year,
        newPayment.month,
        newPayment.amount,
        newPayment.description || undefined
      );
      setSuccess("Pago registrado correctamente");
      setShowAddPayment(false);
      setNewPayment({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        amount: 0,
        description: "",
      });
      fetchPayments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al registrar el pago");
      console.error(error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este pago?")) {
      return;
    }

    try {
      await monthlyPaymentsService.deletePayment(paymentId);
      setSuccess("Pago eliminado");
      fetchPayments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al eliminar el pago");
      console.error(error);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month - 1];
  };

  const handleSave = async () => {
    if (!editedUser) return;

    try {
      const token = localStorage.getItem("authToken");

      // No enviar rut ya que no es modificable
      const userDataToUpdate = {
        email: editedUser.email,
        name: editedUser.name,
        phone: editedUser.phone,
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
            <Tab
              label="🎫 Vales de Gas"
              icon={<LocalGasStation />}
              iconPosition="start"
            />
            <Tab
              label="💰 Registro de Pagos"
              icon={<AttachMoney />}
              iconPosition="start"
            />
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
                    label="RUT"
                    type="text"
                    value={editedUser.rut || ""}
                    disabled={true}
                    placeholder="12345678-9"
                    helperText="El RUT no puede ser modificado"
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

                <TextField
                  fullWidth
                  label="Teléfono"
                  type="text"
                  value={editedUser.phone || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="98765432"
                  helperText="8 dígitos, sin +569"
                  inputProps={{
                    maxLength: 8,
                    pattern: "[0-9]{8}",
                  }}
                  InputProps={{
                    startAdornment: (
                      <Phone sx={{ mr: 1, color: "action.active" }} />
                    ),
                  }}
                />
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

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom mb={2}>
                Gestión de Vales de Gas
              </Typography>

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
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "background.default",
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="h4"
                          color="primary"
                          fontWeight="bold"
                        >
                          {voucherStats.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Vales
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "warning.main",
                          color: "white",
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">
                          {voucherStats.pending}
                        </Typography>
                        <Typography variant="body2">Pendientes</Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "success.main",
                          color: "white",
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">
                          {voucherStats.delivered}
                        </Typography>
                        <Typography variant="body2">Entregados</Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "background.default",
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="h4"
                          color="primary"
                          fontWeight="bold"
                        >
                          ${voucherStats.totalAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Pesos
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Historial de Vales */}
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Historial de Vales
                  </Typography>

                  {vouchers.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: "background.default",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        Este usuario no tiene vales registrados
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Fecha Solicitud</TableCell>
                            <TableCell align="center">Kilos</TableCell>
                            <TableCell align="center">Monto</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vouchers.map((voucher) => (
                            <TableRow key={voucher.id}>
                              <TableCell>
                                {new Date(
                                  voucher.requestDate
                                ).toLocaleDateString()}
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
                              <TableCell>
                                <Box display="flex" gap={1}>
                                  {voucher.status === "pending" && (
                                    <>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        onClick={() =>
                                          handleApproveVoucher(voucher.id)
                                        }
                                      >
                                        Aprobar
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        onClick={() =>
                                          handleRejectVoucher(voucher.id)
                                        }
                                      >
                                        Rechazar
                                      </Button>
                                    </>
                                  )}
                                  {voucher.status === "approved" && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() =>
                                        handleMarkDelivered(voucher.id)
                                      }
                                    >
                                      Marcar Entregado
                                    </Button>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Tab 3: Registro de Pagos Mensuales */}
          {tabValue === 3 && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Registro de Pagos Mensuales
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => setShowAddPayment(!showAddPayment)}
                    >
                      {showAddPayment ? "Cancelar" : "Agregar Pago"}
                    </Button>
                  </Box>

                  {/* Formulario para agregar pago */}
                  {showAddPayment && (
                    <Paper sx={{ p: 3, mb: 3, bgcolor: "background.default" }}>
                      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                        Nuevo Registro de Pago
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <Box display="flex" gap={2}>
                          <FormControl fullWidth>
                            <InputLabel>Año</InputLabel>
                            <Select
                              value={newPayment.year}
                              label="Año"
                              onChange={(e) =>
                                setNewPayment({
                                  ...newPayment,
                                  year: Number(e.target.value),
                                })
                              }
                            >
                              {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <MenuItem key={year} value={year}>
                                    {year}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                          <FormControl fullWidth>
                            <InputLabel>Mes</InputLabel>
                            <Select
                              value={newPayment.month}
                              label="Mes"
                              onChange={(e) =>
                                setNewPayment({
                                  ...newPayment,
                                  month: Number(e.target.value),
                                })
                              }
                            >
                              {[
                                "Enero",
                                "Febrero",
                                "Marzo",
                                "Abril",
                                "Mayo",
                                "Junio",
                                "Julio",
                                "Agosto",
                                "Septiembre",
                                "Octubre",
                                "Noviembre",
                                "Diciembre",
                              ].map((month, index) => (
                                <MenuItem key={index + 1} value={index + 1}>
                                  {month}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <TextField
                          label="Monto"
                          type="number"
                          fullWidth
                          value={newPayment.amount}
                          onChange={(e) =>
                            setNewPayment({
                              ...newPayment,
                              amount: Number(e.target.value),
                            })
                          }
                          InputProps={{
                            startAdornment: <Typography>$</Typography>,
                          }}
                        />
                        <TextField
                          label="Descripción (opcional)"
                          fullWidth
                          multiline
                          rows={2}
                          value={newPayment.description}
                          onChange={(e) =>
                            setNewPayment({
                              ...newPayment,
                              description: e.target.value,
                            })
                          }
                        />
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleAddPayment}
                        >
                          Guardar Pago
                        </Button>
                      </Box>
                    </Paper>
                  )}

                  {/* Resumen de pagos */}
                  {loadingPayments ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress />
                    </Box>
                  ) : paymentSummary.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: "background.default",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No hay registros de pagos para este usuario
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {paymentSummary.map((yearSummary) => (
                        <Paper key={yearSummary.year} sx={{ p: 3, mb: 3 }}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                          >
                            <Typography variant="h6" fontWeight="bold">
                              Año {yearSummary.year}
                            </Typography>
                            <Chip
                              label={`Total: $${yearSummary.total.toLocaleString()}`}
                              color="primary"
                              sx={{ fontWeight: "bold", fontSize: "1rem" }}
                            />
                          </Box>

                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Mes</TableCell>
                                  <TableCell align="right">Monto</TableCell>
                                  <TableCell>Descripción</TableCell>
                                  <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {yearSummary.months.map((monthData) => {
                                  const payment = payments.find(
                                    (p) =>
                                      p.year === yearSummary.year &&
                                      p.month === monthData.month
                                  );
                                  return (
                                    <TableRow key={monthData.month}>
                                      <TableCell>
                                        {getMonthName(monthData.month)}
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography
                                          fontWeight="bold"
                                          color="success.main"
                                        >
                                          $
                                          {monthData.amount.toLocaleString()}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        {monthData.description || "-"}
                                      </TableCell>
                                      <TableCell align="center">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() =>
                                            payment &&
                                            handleDeletePayment(payment.id)
                                          }
                                        >
                                          <Delete />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Paper>
                      ))}
                    </>
                  )}
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
