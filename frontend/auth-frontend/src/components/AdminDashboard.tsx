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
} from "@mui/material";
import EditUserModal from "./admin/EditUserModal";
import AdminChat from "./admin/Chat";
import AdminStats from "./admin/Stats";
import AdminProfile from "./admin/Profile";

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [editError, setEditError] = useState<string | null>(null); // Agregar estado para errores

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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOpenModal(true);
    setEditError(null); // Limpiar errores al abrir el modal
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem("authToken");

      // Enviar solo los campos permitidos
      const userDataToUpdate = {
        email: editingUser.email,
        name: editingUser.name,
        age: editingUser.age,
        role: editingUser.role,
      };

      const response = await fetch(
        `http://localhost:3001/admins/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userDataToUpdate),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al actualizar usuario:", errorData);

        // Manejar errores como array o string
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join("\n")
          : errorData.message || "No se pudo actualizar el usuario";

        setEditError(errorMessage); // Mostrar error en el modal
        return;
      }

      console.log("Usuario actualizado correctamente");
      setOpenModal(false);
      setEditingUser(null);
      setEditError(null); // Limpiar error al guardar exitosamente
      fetchUsers();
    } catch (error) {
      console.error("Error en handleSave:", error);
      alert("Error al guardar los cambios");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar usuario?")) {
      const token = localStorage.getItem("authToken");
      await fetch(`http://localhost:3001/admins/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#0a0a0f",
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
                  color: "#fff",
                  fontWeight: "bold",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Panel de Administración
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.6)", mt: 0.5 }}
              >
                Bienvenido, {adminProfile?.name || "Admin"}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
              },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>

        <Paper
          sx={{
            mb: 3,
            backgroundColor: "rgba(50, 50, 50, 0.5)",
            borderRadius: 2,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": { color: "#ffffff" },
              "& .Mui-selected": { color: "#667eea" },
              "& .MuiTabs-indicator": {
                backgroundColor: "#667eea",
              },
            }}
          >
            <Tab label="📊 Estadísticas" />
            <Tab label="👥 Usuarios" />
            <Tab label="💬 Chat IA" />
            <Tab label="👤 Mi Perfil" />
          </Tabs>
        </Paper>

        {tabValue === 0 && <AdminStats />}

        {tabValue === 1 && (
          <>
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "rgba(50, 50, 50, 0.5)",
                "& .MuiTableCell-root": {
                  color: "#ffffff",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                },
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                  backgroundColor: "rgba(40, 40, 40, 0.8)",
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Edad</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.age}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleEdit(user)}
                          style={{ marginRight: "10px" }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(user.id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <EditUserModal
              open={openModal}
              onClose={handleCloseModal}
              editingUser={editingUser}
              onSave={handleSave}
              onChange={setEditingUser}
              error={editError} // Pasar el mensaje de error al modal
            />
          </>
        )}

        {tabValue === 2 && <AdminChat />}

        {tabValue === 3 && <AdminProfile />}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
