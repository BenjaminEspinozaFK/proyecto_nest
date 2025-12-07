import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import {
  Email,
  Lock,
  Person,
  Cake,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    rut: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        rut: formData.rut,
      });
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
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              Crear cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Regístrate para comenzar
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* Nombre */}
            <TextField
              label="Nombre completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              inputProps={{ minLength: 2 }}
              fullWidth
              variant="outlined"
              autoComplete="name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Email y Edad en Stack */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Correo electrónico"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                fullWidth
                variant="outlined"
                autoComplete="email"
                sx={{ flex: { sm: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="RUT"
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="12345678-9"
                fullWidth
                variant="outlined"
                sx={{ flex: { sm: 1 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Cake color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {/* Password con toggle visibility */}
            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              inputProps={{ minLength: 6 }}
              fullWidth
              variant="outlined"
              autoComplete="new-password"
              helperText="Mínimo 6 caracteres"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
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
              fullWidth
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="O" size="small" />
          </Divider>

          {/* Login Link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes una cuenta?
            </Typography>
            <Button
              variant="text"
              onClick={onSwitchToLogin}
              disabled={isLoading}
              color="inherit"
              sx={{ mt: 1 }}
            >
              Iniciar sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
