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
        <TableContainer
          component={Paper}
          sx={{ backgroundColor: "rgba(30, 30, 30, 0.8)" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ color: "#ffffff", fontWeight: "bold" }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{ color: "#ffffff", fontWeight: "bold" }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{ color: "#ffffff", fontWeight: "bold" }}
                >
                  Nombre
                </TableCell>
                <TableCell
                  sx={{ color: "#ffffff", fontWeight: "bold" }}
                >
                  Edad
                </TableCell>
                <TableCell
                  sx={{ color: "#ffffff", fontWeight: "bold" }}
                >
                  Rol
                </TableCell>
                <TableCell
                  sx={{ color: "#ffffff", fontWeight: "bold" }}
                >
                  Creado
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {res.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ color: "#ffffff" }}>{user.id}</TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>{user.email}</TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>{user.name}</TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>{user.age}</TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>{user.role}</TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
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
      return <Typography sx={{ color: "#ffffff" }}>{String(res)}</Typography>;
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Chat de Administración
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: "rgba(50, 50, 50, 0.5)" }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Escribe tu comando (ej: Agrega un usuario llamado Juan con email juan@example.com, edad 25 y password 123456)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            mb: 2,
            "& .MuiInputBase-root": {
              color: "#ffffff",
            },
            "& .MuiInputLabel-root": {
              color: "#ffffff",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ffffff",
              },
            },
          }}
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
