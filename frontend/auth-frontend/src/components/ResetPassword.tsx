import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

interface ResetPasswordProps {
  onBackToLogin: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onBackToLogin }) => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Token no encontrado en la URL");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3001/auth/reset-password",
        { token, newPassword }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        onBackToLogin();
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al restablecer la contraseña"
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
              Nueva contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tu nueva contraseña
            </Typography>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
              <br />
              Redirigiendo al login en 3 segundos...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!message && (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                fullWidth
                label="Nueva contraseña"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                inputProps={{ minLength: 6 }}
                helperText="Mínimo 6 caracteres"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirmar contraseña"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                inputProps={{ minLength: 6 }}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !token}
              >
                {loading ? "Procesando..." : "Cambiar contraseña"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPassword;
