import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd,
  AdminPanelSettings,
  Person,
} from "@mui/icons-material";

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, role);
    } catch (err) {}
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          {/* Header con ícono */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Paper
              elevation={3}
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <LoginIcon sx={{ fontSize: 40, color: "white" }} />
            </Paper>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Bienvenido
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Inicia sesión para continuar
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* Email */}
            <TextField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              fullWidth
              variant="outlined"
              autoComplete="email"
            />

            {/* Password con toggle visibility */}
            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              inputProps={{ minLength: 6 }}
              fullWidth
              variant="outlined"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Role selector con chips visuales */}
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel id="role-label">Tipo de cuenta</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="Tipo de cuenta"
                onChange={(e) => setRole(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    {role === "admin" ? (
                      <AdminPanelSettings color="warning" />
                    ) : (
                      <Person color="primary" />
                    )}
                  </InputAdornment>
                }
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

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              size="large"
              startIcon={!isLoading && <LoginIcon />}
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #6a3a8d 100%)",
                },
              }}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="O" size="small" />
          </Divider>

          {/* Register Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              ¿No tienes una cuenta?
            </Typography>
            <Button
              variant="outlined"
              onClick={onSwitchToRegister}
              disabled={isLoading}
              startIcon={<PersonAdd />}
              sx={{
                mt: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Crear cuenta nueva
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
