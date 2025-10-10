import React from "react";
import { useAuth } from "./AuthContext";
import AdminDashboard from "./AdminDashboard"; // Agregar import
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

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
      <Card sx={{ maxWidth: 1700, width: "100%", padding: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
              paddingBottom: 1,
              borderBottom: "2px solid #f0f0f0",
            }}
          >
            <Typography variant="h4" component="h2">
              ¡Bienvenido!
            </Typography>
            <Button variant="contained" color="error" onClick={logout}>
              Cerrar Sesión
            </Button>
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="h5" gutterBottom>
              Información del Usuario:
            </Typography>
            <Typography variant="body1">
              <strong>Nombre:</strong> {user.name}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body1">
              <strong>Edad:</strong> {user.age} años
            </Typography>
            <Typography variant="body1">
              <strong>Rol:</strong> {user.role}
            </Typography>
          </Box>
          {user.role === "admin" && <AdminDashboard />}
          <Typography variant="body2" sx={{ color: "green", marginTop: 2 }}>
            ✅ Autenticación JWT exitosa
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;
