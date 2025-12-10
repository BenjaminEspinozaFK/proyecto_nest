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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  People,
  Receipt,
  BarChart,
  AccountCircle,
  Settings,
  Logout,
  Add,
} from "@mui/icons-material";
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const openMenu = Boolean(anchorEl);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    setShowProfile(true);
    handleMenuClose();
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
        {/* Header con título y menú de usuario */}
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
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 0.5,
              }}
            >
              Panel de Administración
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Gestiona usuarios y solicitudes de vales
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {toggleTheme && (
              <IconButton
                onClick={toggleTheme}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    background: "rgba(102, 126, 234, 0.1)",
                  },
                }}
              >
                {isDark ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            )}

            {adminProfile?.role === "admin" && tabValue === 0 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreate}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                Crear Usuario
              </Button>
            )}

            {/* Avatar con menú desplegable */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0,
                border: "3px solid transparent",
                background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box",
                borderRadius: "50%",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                src={
                  adminProfile?.avatar
                    ? `http://localhost:3001${adminProfile.avatar}`
                    : undefined
                }
                sx={{
                  width: 48,
                  height: 48,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "1.2rem",
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
            </IconButton>

            {/* Menú desplegable */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                  mt: 1.5,
                  borderRadius: "12px",
                  minWidth: 220,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {adminProfile?.name || "Admin"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                  {adminProfile?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleViewProfile}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mi Perfil</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Configuración</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "error.main",
                  "&:hover": {
                    backgroundColor: "error.lighter",
                  },
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "error.main" }} />
                </ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Paper
          sx={{
            mb: 3,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                minHeight: 64,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.08)",
                },
              },
              "& .Mui-selected": {
                color: "#667eea !important",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
            }}
          >
            <Tab icon={<People />} iconPosition="start" label="Usuarios" />
            <Tab icon={<Receipt />} iconPosition="start" label="Solicitudes de Vales" />
            <Tab icon={<BarChart />} iconPosition="start" label="Estadísticas" />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
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
                    <TableCell>RUT</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.rut}</TableCell>
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

        {tabValue === 1 && <VoucherRequests />}

        {tabValue === 2 && <AdminStats />}

        {/* Modal de perfil */}
        {showProfile && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1300,
            }}
            onClick={() => setShowProfile(false)}
          >
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: "20px",
                maxWidth: "800px",
                width: "90%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AdminProfile />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
