import React, { useEffect, useState } from "react";
import { User } from "../types/auth"; // Ajusta la ruta si es necesario
import {
  Box,
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Tabs,
  Tab,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import UserDetailModal from "./admin/UserDetailModal";
import AdminStats from "./admin/Stats";
import AdminProfile from "./admin/Profile";
import CreateUserModal from "./admin/CreateUserModal";
import VoucherRequests from "./admin/VoucherRequests";

interface AdminDashboardProps {
  toggleTheme?: () => void;
  isDark?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  toggleTheme,
  isDark,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/admins/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAdminProfile(data);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch("http://localhost:3001/admins/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched users:", data); // Para debug
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleCreated = () => {
    // Después de crear, refrescar la lista
    fetchUsers();
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
                adminProfile?.avatar
                  ? `http://localhost:3001${adminProfile.avatar}`
                  : undefined
              }
              sx={{
                width: 64,
                height: 64,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {adminProfile?.name
                ? adminProfile.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : "AD"}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                }}
              >
                Panel de Administración
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Bienvenido, {adminProfile?.name || "Admin"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {toggleTheme && (
              <IconButton onClick={toggleTheme}>
                {isDark ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            )}
            {adminProfile?.role === "admin" && tabValue === 1 && (
              <Button variant="contained" onClick={handleOpenCreate}>
                Crear usuario
              </Button>
            )}
            <Button variant="contained" onClick={handleLogout}>
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
            <Tab label="📊 Estadísticas" />
            <Tab label="👥 Usuarios" />
            <Tab label="🎫 Solicitudes Vales" />
            <Tab label=" Mi Perfil" />
          </Tabs>
        </Paper>

        {tabValue === 0 && <AdminStats />}

        {tabValue === 1 && (
          <>
            <TableContainer
              component={Paper}
              sx={{
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Edad</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenDetailModal(true);
                          }}
                        >
                          Ver Perfil
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Botón movido al header */}

            <CreateUserModal
              open={createOpen}
              onClose={() => setCreateOpen(false)}
              onCreated={handleCreated}
            />

            <UserDetailModal
              open={openDetailModal}
              onClose={() => {
                setOpenDetailModal(false);
                setSelectedUser(null);
              }}
              user={selectedUser}
              onUpdate={fetchUsers}
            />
          </>
        )}

        {tabValue === 2 && <VoucherRequests />}

        {tabValue === 3 && <AdminProfile />}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
