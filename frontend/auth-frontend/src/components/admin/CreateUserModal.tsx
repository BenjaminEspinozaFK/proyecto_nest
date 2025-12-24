import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // callback para refrescar lista
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<any>(null);

  const handleCreate = async () => {
    setError(null);

    if (!email || !rut) {
      setError("Email y RUT son obligatorios");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const body: any = { email, name, rut, role };

      // Solo incluir password si se proporcionó
      if (password && password.trim()) {
        body.password = password;
      }

      // Solo incluir phone si se proporcionó
      if (phone && phone.trim()) {
        body.phone = phone;
      }

      const response = await fetch("http://localhost:3001/admins/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg = data?.message || `Error ${response.status}`;
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        setLoading(false);
        return;
      }

      // éxito
      onCreated();
      onClose();
      // limpiar campos
      setEmail("");
      setPassword("");
      setName("");
      setRut("");
      setRole("user");
    } catch (err: any) {
      setError(err.message || "Error creando usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setBulkResult(null);
      setError(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
      setError("Selecciona un archivo Excel primero");
      return;
    }

    setError(null);
    setLoading(true);
    setBulkResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:3001/admins/users/bulk-excel",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg = data?.message || `Error ${response.status}`;
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        setLoading(false);
        return;
      }

      const result = await response.json();
      setBulkResult(result);

      if (result.success && result.success.length > 0) {
        onCreated(); // Refrescar lista
      }
    } catch (err: any) {
      setError(err.message || "Error cargando archivo");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setEmail("");
    setPassword("");
    setName("");
    setRut("");
    setPhone("");
    setRole("user");
    setFile(null);
    setBulkResult(null);
    setError(null);
    setTabValue(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
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
          width: 600,
          maxHeight: "80vh",
          overflow: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.12)"
            }`,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Crear usuarios
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Manual" />
          <Tab label="Carga masiva (Excel)" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tabValue === 0 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                💡 <strong>Seguridad mejorada:</strong> Si no ingresas una
                contraseña, el sistema generará automáticamente una contraseña
                temporal segura y la enviará por email al usuario.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Contraseña (opcional)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              placeholder="Dejar vacío para generar automáticamente"
              helperText="Si está vacío, se enviará una contraseña temporal por email"
            />
            <TextField
              fullWidth
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="RUT"
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              margin="normal"
              required
              placeholder="12345678-9"
            />
            <TextField
              fullWidth
              label="Teléfono"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
              placeholder="98765432"
              helperText="8 dígitos, sin +569 (opcional)"
              inputProps={{
                maxLength: 8,
                pattern: "[0-9]{8}",
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Rol</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="Rol"
                onChange={(e) => setRole(e.target.value as "user" | "admin")}
              >
                <MenuItem value="user">Usuario</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear usuario"}
              </Button>
            </Box>
          </>
        )}

        {tabValue === 1 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Formato requerido:
              </Typography>
              <Typography variant="caption">
                El archivo Excel debe tener las columnas: <strong>email</strong>
                , <strong>rut</strong> (requeridos), y opcionalmente{" "}
                <strong>password</strong>, <strong>name</strong>,{" "}
                <strong>phone</strong> (8 dígitos) y <strong>role</strong>{" "}
                (user/admin). Si no se proporciona contraseña, se generará
                automáticamente y se enviará por email.
              </Typography>
            </Alert>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Seleccionar archivo Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </Button>

            {file && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Archivo seleccionado: <strong>{file.name}</strong>
              </Typography>
            )}

            {bulkResult && (
              <Box sx={{ mb: 2 }}>
                <Alert
                  severity={
                    bulkResult.errors.length > 0 ? "warning" : "success"
                  }
                >
                  {bulkResult.message}
                </Alert>

                {bulkResult.success.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="success.main">
                      ✅ Usuarios creados exitosamente:{" "}
                      {bulkResult.success.length}
                    </Typography>
                    <List dense>
                      {bulkResult.success.slice(0, 5).map((item: any) => (
                        <ListItem key={item.row}>
                          <ListItemText
                            primary={item.user.email}
                            secondary={`Fila ${item.row} - ${item.user.role}`}
                          />
                        </ListItem>
                      ))}
                      {bulkResult.success.length > 5 && (
                        <Typography variant="caption" sx={{ pl: 2 }}>
                          ... y {bulkResult.success.length - 5} más
                        </Typography>
                      )}
                    </List>
                  </Box>
                )}

                {bulkResult.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="error.main">
                      ❌ Errores: {bulkResult.errors.length}
                    </Typography>
                    <List dense>
                      {bulkResult.errors
                        .slice(0, 5)
                        .map((item: any, idx: number) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={`Fila ${item.row}: ${item.error}`}
                              secondary={
                                item.data ? JSON.stringify(item.data) : ""
                              }
                            />
                          </ListItem>
                        ))}
                      {bulkResult.errors.length > 5 && (
                        <Typography variant="caption" sx={{ pl: 2 }}>
                          ... y {bulkResult.errors.length - 5} más
                        </Typography>
                      )}
                    </List>
                  </Box>
                )}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cerrar
              </Button>
              <Button
                variant="contained"
                onClick={handleBulkUpload}
                disabled={loading || !file}
              >
                {loading ? "Procesando..." : "Subir y Crear"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default CreateUserModal;
