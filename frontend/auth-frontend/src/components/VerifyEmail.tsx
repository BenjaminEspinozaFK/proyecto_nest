import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { authService } from "../services/authService";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Token de verificación no encontrado en la URL");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setMessage(response.message);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: 3,
          p: 4,
        }}
      >
        <CardContent sx={{ padding: 0, textAlign: "center" }}>
          {loading ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">
                Verificando tu correo electrónico...
              </Typography>
            </Box>
          ) : message ? (
            <Box sx={{ py: 3 }}>
              <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                ¡Correo verificado!
              </Typography>
              <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
                {message}
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                size="large"
              >
                Iniciar sesión
              </Button>
            </Box>
          ) : (
            <Box sx={{ py: 3 }}>
              <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                Error de verificación
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                {error}
              </Alert>
              <Button
                variant="outlined"
                onClick={() => navigate("/register")}
                size="large"
              >
                Volver al registro
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VerifyEmail;