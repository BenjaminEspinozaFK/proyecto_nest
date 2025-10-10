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
} from "@mui/material";
import { User } from "../../types/auth";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  editingUser: User | null;
  onSave: () => void;
  onChange: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  editingUser,
  onSave,
  onChange,
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
              label="Edad"
              type="number"
              value={editingUser.age || ""}
              onChange={(e) =>
                onChange({ ...editingUser, age: parseInt(e.target.value) || 0 })
              }
              margin="normal"
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
