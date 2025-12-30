import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Chip,
} from "@mui/material";
import { AdminPanelSettings, Person } from "@mui/icons-material";
import axios from "axios";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3001/auth/forgot-password",
        { email, role }
      );

      setMessage(response.data.message);
      setEmail("");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al solicitar recuperación de contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: 3,
          p: 4,
        }}
      >
        <CardContent sx={{ padding: 0 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              ¿Olvidaste tu contraseña?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tu email y te enviaremos un enlace para restablecerla
            </Typography>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              variant="outlined"
            />

            <FormControl fullWidth disabled={loading}>
              <InputLabel id="role-label">Tipo de cuenta</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="Tipo de cuenta"
                onChange={(e) => setRole(e.target.value as "user" | "admin")}
              >
                <MenuItem value="user">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person color="primary" />
                    <Typography>Usuario</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="admin">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AdminPanelSettings color="warning" />
                    <Typography>Administrador</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="O" size="small" />
          </Divider>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="text"
              onClick={onBackToLogin}
              disabled={loading}
              color="inherit"
            >
              Volver al inicio de sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
