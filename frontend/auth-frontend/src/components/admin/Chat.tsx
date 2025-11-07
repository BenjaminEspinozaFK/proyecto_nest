import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { adminService } from "../../services/adminService";

const AdminChat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await adminService.sendChatMessage(message);
      setResponse(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderResponse = (res: any) => {
    if (Array.isArray(res)) {
      // Assume it's list of users
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Edad</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Creado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {res.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.age}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    } else if (typeof res === "object" && res !== null) {
      // Single user or other object
      return (
        <Box>
          {Object.entries(res).map(([key, value]) => (
            <Typography key={key} sx={{ color: "#ffffff", mb: 1 }}>
              <strong>{key}:</strong>{" "}
              {typeof value === "string" && value.includes("T")
                ? new Date(value).toLocaleString()
                : String(value)}
            </Typography>
          ))}
        </Box>
      );
    } else {
      // String or other
      return <Typography>{String(res)}</Typography>;
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Chat de Administración
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Escribe tu comando (ej: Agrega un usuario llamado Juan con email juan@example.com, edad 25 y password 123456)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !message.trim()}
          sx={{ mb: 2 }}
        >
          {loading ? "Enviando..." : "Enviar"}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {response && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Respuesta:
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: "rgba(40, 40, 40, 0.8)" }}>
              {renderResponse(response)}
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminChat;
