import React, { useEffect, useState } from "react";
import { User } from "../types/auth"; // Ajusta la ruta si es necesario
import {
  Typography,
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Container,
} from "@mui/material";
import EditUserModal from "./admin/EditUserModal";

const AdminDashboard: React.FC = () => {
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
    const token = localStorage.getItem("authToken");
    await fetch(`http://localhost:3001/admins/users/${editingUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editingUser),
    });
    setOpenModal(false);
    setEditingUser(null);
    fetchUsers();
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
    <Container maxWidth={false} sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Panel de Administrador
      </Typography>
      <TableContainer component={Paper}>
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
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEdit(user)}
                    style={{ marginRight: "10px" }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
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
    </Container>
  );
};

export default AdminDashboard;
