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
} from "@mui/material";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
  });
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
        age: parseInt(formData.age),
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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent sx={{ padding: 3 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Crear Cuenta
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Nombre"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              inputProps={{ minLength: 2 }}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              fullWidth
            />
            <TextField
              label="Edad"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              disabled={isLoading}
              inputProps={{ min: 1, max: 120 }}
              fullWidth
            />
            <TextField
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              inputProps={{ minLength: 6 }}
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </Box>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿Ya tienes cuenta?{" "}
            <Button
              variant="text"
              onClick={onSwitchToLogin}
              disabled={isLoading}
              sx={{ p: 0, minWidth: "auto" }}
            >
              Inicia sesión aquí
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
