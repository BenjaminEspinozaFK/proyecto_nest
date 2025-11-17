import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
} from "@mui/material";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // callback para refrescar lista
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);

    if (!email || !password || !age) {
      setError("Email, contraseña y edad son obligatorios");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/admins/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, name, age, role }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg = data?.message || `Error ${response.status}`;
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        setLoading(false);
        return;
      }

      // éxito
      onCreated();
      onClose();
      // limpiar campos
      setEmail("");
      setPassword("");
      setName("");
      setAge("");
      setRole("user");
    } catch (err: any) {
      setError(err.message || "Error creando usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Crear nuevo usuario
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Edad"
          type="number"
          value={age}
          onChange={(e) =>
            setAge(e.target.value === "" ? "" : parseInt(e.target.value))
          }
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-label">Rol</InputLabel>
          <Select
            labelId="role-label"
            value={role}
            label="Rol"
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
          >
            <MenuItem value="user">Usuario</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
          </Select>
        </FormControl>

        <Box
          sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            {loading ? "Creando..." : "Crear usuario"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateUserModal;
