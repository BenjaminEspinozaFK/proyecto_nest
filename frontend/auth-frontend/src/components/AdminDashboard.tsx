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

  useEffect(() => {
    fetchUsers();
  }, []);

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
        alert(
          `Error: ${errorData.message || "No se pudo actualizar el usuario"}`
        );
        return;
      }

      console.log("Usuario actualizado correctamente");
      setOpenModal(false);
      setEditingUser(null);
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

  return (
    <Box>
      <Paper sx={{ mb: 3, backgroundColor: "rgba(50, 50, 50, 0.5)" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            "& .MuiTab-root": { color: "#ffffff" },
            "& .Mui-selected": { color: "#1976d2" },
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
          />
        </>
      )}

      {tabValue === 2 && <AdminChat />}

      {tabValue === 3 && <AdminProfile />}
    </Box>
  );
};

export default AdminDashboard;
