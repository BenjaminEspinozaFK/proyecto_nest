import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Pagination,
} from "@mui/material";
import { History, FilterAltOff } from "@mui/icons-material";
import { auditLogService } from "../../services/auditLogService";
import { AuditLog as AuditLogEntry } from "../../types/auditLog";
import TableRowsSkeleton from "../skeletons/TableRowsSkeleton";

const ENTITY_TYPES = ["User", "Admin", "GasVoucher", "MonthlyPayment"];

const ENTITY_LABELS: Record<string, string> = {
  User: "Usuario",
  Admin: "Administrador",
  GasVoucher: "Vale de Gas",
  MonthlyPayment: "Pago Mensual",
};

const ACTION_COLORS: Record<
  string,
  "success" | "info" | "error" | "warning" | "default"
> = {
  create: "success",
  update: "info",
  delete: "error",
  approve: "success",
  reject: "error",
  deliver: "success",
  "manual-create": "success",
  "bulk-create": "success",
};

function actionColor(action: string) {
  const suffix = action.split(".")[1] || action;
  return ACTION_COLORS[suffix] || "default";
}

const AdminAuditLog: React.FC = () => {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [admins, setAdmins] = useState<{ id: string; name: string | null }[]>(
    [],
  );
  const [adminId, setAdminId] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    auditLogService
      .getFilterOptions()
      .then((data) => setAdmins(data.admins))
      .catch((err) => console.error("Error cargando filtros:", err));
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditLogService.list({
        adminId: adminId || undefined,
        entityType: entityType || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        page,
        pageSize: 15,
      });
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Error cargando el registro de auditoría:", err);
    } finally {
      setLoading(false);
    }
  }, [adminId, entityType, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const hasActiveFilters =
    adminId !== "" || entityType !== "" || dateFrom !== "" || dateTo !== "";

  const clearFilters = () => {
    setAdminId("");
    setEntityType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <History /> Registro de Auditoría
        </Typography>
      </Box>

      {/* Barra de filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Administrador</InputLabel>
            <Select
              value={adminId}
              label="Administrador"
              onChange={(e) => {
                setAdminId(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {admins.map((admin) => (
                <MenuItem key={admin.id} value={admin.id}>
                  {admin.name || admin.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Entidad</InputLabel>
            <Select
              value={entityType}
              label="Entidad"
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              {ENTITY_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {ENTITY_LABELS[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Desde"
            type="date"
            size="small"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FilterAltOff />}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Limpiar filtros
          </Button>
        </Box>
      </Paper>

      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold">
            Acciones registradas ({total})
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Administrador</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Entidad</TableCell>
                <TableCell>Descripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRowsSkeleton rows={8} columns={5} />
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No hay registros de auditoría
                      {hasActiveFilters ? " para estos filtros" : ""}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString("es-CL")}
                    </TableCell>
                    <TableCell>{log.adminName || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        color={actionColor(log.action)}
                      />
                    </TableCell>
                    <TableCell>
                      {ENTITY_LABELS[log.entityType] || log.entityType}
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminAuditLog;
