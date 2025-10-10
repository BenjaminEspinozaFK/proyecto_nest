import React, { useEffect, useState } from "react";
import { User } from "../types/auth"; // Ajusta la ruta si es necesario

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  return (
    <div>
      <h3>Panel de Administrador</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>{user.age}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Editar</button>
                <button onClick={() => handleDelete(user.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingUser && (
        <div>
          <input
            value={editingUser.name || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, name: e.target.value })
            }
            placeholder="Nombre"
          />
          <input
            value={editingUser.age || ""}
            type="number"
            onChange={(e) =>
              setEditingUser({ ...editingUser, age: parseInt(e.target.value) })
            }
            placeholder="Edad"
          />
          <select
            value={editingUser.role || "user"}
            onChange={(e) =>
              setEditingUser({ ...editingUser, role: e.target.value })
            }
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          <button onClick={handleSave}>Guardar</button>
          <button onClick={() => setEditingUser(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
