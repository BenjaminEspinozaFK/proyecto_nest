import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { darkTheme } from "./theme";
import "./App.css";

type ViewType = "login" | "register" | "forgot" | "reset";

const AuthApp: React.FC = () => {
  const [view, setView] = useState<ViewType>("login");
  const { user } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasResetToken = urlParams.has("token");
    if (hasResetToken) {
      setView("reset");
    }
  }, []);

  // Si el usuario está logueado, mostrar dashboard
  if (user) {
    return <Dashboard />;
  }

  // Renderizar según vista actual
  switch (view) {
    case "register":
      return <Register onSwitchToLogin={() => setView("login")} />;
    case "forgot":
      return <ForgotPassword onBackToLogin={() => setView("login")} />;
    case "reset":
      return <ResetPassword onBackToLogin={() => setView("login")} />;
    default:
      return (
        <Login
          onSwitchToRegister={() => setView("register")}
          onForgotPassword={() => setView("forgot")}
        />
      );
  }
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <div className="App">
          <AuthApp />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
