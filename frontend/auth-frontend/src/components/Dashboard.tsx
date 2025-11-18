import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import AdminDashboard from "./AdminDashboard";
import UserProfile from "./UserProfile";
import {
  Box,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  LogoutOutlined,
  Brightness4,
  Brightness7,
  Person,
} from "@mui/icons-material";

interface DashboardProps {
  toggleTheme: () => void;
  isDark: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleTheme, isDark }) => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  if (!user) {
    return null;
  }

  // Si es admin, mostrar AdminDashboard directamente a pantalla completa
  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        py: 4,
        px: 3,
      }}
    >
      <Box sx={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header con título y logout */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            pb: 3,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={
                user.avatar ? `http://localhost:3001${user.avatar}` : undefined
              }
              sx={{
                width: 64,
                height: 64,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {user.name
                ? user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                }}
              >
                Panel de Usuario
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Bienvenido, {user.name || "Usuario"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={toggleTheme}>
              {isDark ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Button
              variant="contained"
              onClick={handleLogout}
              startIcon={<LogoutOutlined />}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </Box>

        <Paper
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              "& .Mui-selected": { color: "#667eea" },
              "& .MuiTabs-indicator": {
                backgroundColor: "#667eea",
              },
            }}
          >
            <Tab icon={<Person />} label="👤 Mi Perfil" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>{tabValue === 0 && <UserProfile />}</Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
