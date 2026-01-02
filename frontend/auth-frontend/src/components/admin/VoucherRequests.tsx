import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { voucherService } from "../../services/voucherService";
import { GasVoucher, VoucherStats } from "../../types/voucher";
import { useSocket } from "../../hooks/useSocket";

const VoucherRequests: React.FC = () => {
  const [pendingVouchers, setPendingVouchers] = useState<GasVoucher[]>([]);
  const [allVouchers, setAllVouchers] = useState<GasVoucher[]>([]);
  const [stats, setStats] = useState<VoucherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Estados para aprobar
  const [approveDialog, setApproveDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<GasVoucher | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // Socket.IO para actualizaciones en tiempo real (admin)
  const socket = useSocket(undefined, true);

  useEffect(() => {
    fetchData();
  }, []);

  // Escuchar eventos de Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleVoucherCreated = (voucher: GasVoucher) => {
      console.log("🎫 Nuevo vale creado:", voucher);
      fetchData(); // Recargar datos
    };

    const handleVoucherApproved = (voucher: GasVoucher) => {
      console.log("✅ Vale aprobado:", voucher);
      fetchData();
    };

    const handleVoucherRejected = (voucher: GasVoucher) => {
      console.log("❌ Vale rechazado:", voucher);
      fetchData();
    };

    const handleVoucherDelivered = (voucher: GasVoucher) => {
      console.log("📦 Vale entregado:", voucher);
      fetchData();
    };

    socket.on("voucher:created", handleVoucherCreated);
    socket.on("voucher:approved", handleVoucherApproved);
    socket.on("voucher:rejected", handleVoucherRejected);
    socket.on("voucher:delivered", handleVoucherDelivered);

    return () => {
      socket.off("voucher:created", handleVoucherCreated);
      socket.off("voucher:approved", handleVoucherApproved);
      socket.off("voucher:rejected", handleVoucherRejected);
      socket.off("voucher:delivered", handleVoucherDelivered);
    };
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pending, all, statsData] = await Promise.all([
        voucherService.getPendingVouchers(),
        voucherService.getAllVouchers(),
        voucherService.getGeneralStats(),
      ]);
      setPendingVouchers(pending);
      setAllVouchers(all);
      setStats(statsData);
    } catch (error) {
      console.error("Error al cargar vales:", error);
      setError("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVoucher || !amount) return;

    try {
      await voucherService.approveVoucher(selectedVoucher.id, {
        amount: parseFloat(amount),
        notes: notes || undefined,
      });
      setSuccess("Vale aprobado correctamente");
      setApproveDialog(false);
      setSelectedVoucher(null);
      setAmount("");
      setNotes("");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al aprobar el vale");
      console.error(error);
    }
  };

  const handleReject = async (voucherId: string) => {
    const reason = prompt("Razón del rechazo (opcional):");

    try {
      await voucherService.rejectVoucher(voucherId, {
        notes: reason || undefined,
      });
      setSuccess("Vale rechazado");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al rechazar el vale");
      console.error(error);
    }
  };

  const handleMarkDelivered = async (voucherId: string) => {
    if (!window.confirm("¿Confirmar que el vale fue entregado?")) return;

    try {
      await voucherService.markAsDelivered(voucherId);
      setSuccess("Vale marcado como entregado");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al marcar como entregado");
      console.error(error);
    }
  };

  const openApproveDialog = (voucher: GasVoucher) => {
    setSelectedVoucher(voucher);
    setApproveDialog(true);
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

  const vouchersToShow = showAll ? allVouchers : pendingVouchers;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Gestión de Vales de Gas
        </Typography>
        <Button
          variant={showAll ? "contained" : "outlined"}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Ver Solo Pendientes" : "Ver Todos"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Estadísticas */}
      {stats && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Vales
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
              {stats.pending}
            </Typography>
            <Typography variant="body2">Pendientes</Typography>
          </Paper>
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              bgcolor: "info.main",
              color: "white",
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              {stats.approved}
            </Typography>
            <Typography variant="body2">Aprobados</Typography>
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
              {stats.delivered}
            </Typography>
            <Typography variant="body2">Entregados</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              ${stats.totalAmount.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Pesos
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Tabla de vales */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold">
            {showAll
              ? `Todos los Vales (${vouchersToShow.length})`
              : `Solicitudes Pendientes (${pendingVouchers.length})`}
          </Typography>
        </Box>

        {vouchersToShow.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {showAll
                ? "No hay vales registrados"
                : "No hay solicitudes pendientes 🎉"}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Funcionario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Fecha Solicitud</TableCell>
                  <TableCell align="center">Kilos</TableCell>
                  <TableCell align="center">Monto</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vouchersToShow.map((voucher) => (
                  <TableRow
                    key={voucher.id}
                    sx={{
                      bgcolor:
                        voucher.status === "pending"
                          ? "rgba(255, 152, 0, 0.05)"
                          : "transparent",
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="500">
                        {voucher.user?.name || "Usuario"}
                      </Typography>
                    </TableCell>
                    <TableCell>{voucher.user?.email || "-"}</TableCell>
                    <TableCell align="center">
                      {new Date(voucher.requestDate).toLocaleDateString(
                        "es-ES"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold">
                        {voucher.kilos} kg
                      </Typography>
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
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {voucher.status === "pending" && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => openApproveDialog(voucher)}
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleReject(voucher.id)}
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        {voucher.status === "approved" && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleMarkDelivered(voucher.id)}
                          >
                            Marcar Entregado
                          </Button>
                        )}
                        {voucher.status === "delivered" && (
                          <Typography variant="body2" color="success.main">
                            ✓ Completado
                          </Typography>
                        )}
                        {voucher.status === "rejected" && (
                          <Typography variant="body2" color="error.main">
                            ✗ Rechazado
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog para aprobar con monto */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)}>
        <DialogTitle>Aprobar Vale de Gas</DialogTitle>
        <DialogContent>
          {selectedVoucher && (
            <Box sx={{ pt: 2, minWidth: 400 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Funcionario: <strong>{selectedVoucher.user?.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cantidad: <strong>{selectedVoucher.kilos} kg</strong>
              </Typography>
              <TextField
                fullWidth
                label="Monto (en pesos)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{ mt: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Notas (opcional)"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={!amount}
          >
            Aprobar Vale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoucherRequests;
