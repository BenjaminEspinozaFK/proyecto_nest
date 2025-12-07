import React from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  Alert, // Agregar este import
} from "@mui/material";
import { User } from "../../types/auth";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  editingUser: User | null;
  onSave: () => void;
  onChange: (user: User) => void;
  error?: string | null; // Agregar esta prop
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  editingUser,
  onSave,
  onChange,
  error, // Agregar esta prop
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Editar Usuario
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {editingUser && (
          <>
            <TextField
              fullWidth
              label="Nombre"
              value={editingUser.name || ""}
              onChange={(e) =>
                onChange({ ...editingUser, name: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="RUT"
              type="text"
              value={editingUser.rut || ""}
              onChange={(e) =>
                onChange({ ...editingUser, rut: e.target.value })
              }
              margin="normal"
              placeholder="12345678-9"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Rol</InputLabel>
              <Select
                value={editingUser.role || "user"}
                onChange={(e) =>
                  onChange({ ...editingUser, role: e.target.value })
                }
              >
                <MenuItem value="user">Usuario</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Button variant="contained" color="primary" onClick={onSave}>
                Guardar
              </Button>
              <Button variant="outlined" onClick={onClose}>
                Cancelar
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default EditUserModal;
