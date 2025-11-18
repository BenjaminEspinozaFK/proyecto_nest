import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  People,
  PersonAdd,
  TrendingUp,
  AdminPanelSettings,
} from "@mui/icons-material";
import { adminService } from "../../services/adminService";

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  usersToday: number;
  usersThisWeek: number;
  usersThisMonth: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
  }>;
  recentLogins: Array<{
    id: string;
    name: string;
    email: string;
    lastLogin: string;
  }>;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
}

const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card
    sx={{
      background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
      border: `1px solid ${color}44`,
    }}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color, fontSize: 48, opacity: 0.8 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
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

  if (!stats) {
    return (
      <Typography color="error">Error al cargar las estadísticas</Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" mb={3}>
        📊 Estadísticas del Sistema
      </Typography>

      {/* Cards de estadísticas principales */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatsCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={<People />}
          color="#1976d2"
        />
        <StatsCard
          title="Administradores"
          value={stats.totalAdmins}
          icon={<AdminPanelSettings />}
          color="#9c27b0"
        />
        <StatsCard
          title="Usuarios Hoy"
          value={stats.usersToday}
          icon={<PersonAdd />}
          color="#2e7d32"
        />
        <StatsCard
          title="Esta Semana"
          value={stats.usersThisWeek}
          icon={<TrendingUp />}
          color="#ed6c02"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Usuarios por rol */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Usuarios por Rol
          </Typography>
          {stats.usersByRole.map((item) => (
            <Box
              key={item.role}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="body1" textTransform="capitalize">
                {item.role}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {item.count}
              </Typography>
            </Box>
          ))}
        </Paper>

        {/* Usuarios recientes */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
            Últimos Usuarios Registrados
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Nombre
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Rol
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Registrado
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Últimos logins */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
          Últimos Inicios de Sesión
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Último Login
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recentLogins.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Nunca"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminStats;
