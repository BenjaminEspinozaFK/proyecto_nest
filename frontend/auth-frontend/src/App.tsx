import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { darkTheme, lightTheme } from "./theme";
import "./App.css";

type ViewType = "login" | "register" | "forgot" | "reset";

const AuthApp: React.FC<{ toggleTheme: () => void; isDark: boolean }> = ({
  toggleTheme,
  isDark,
}) => {
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
    return <Dashboard toggleTheme={toggleTheme} isDark={isDark} />;
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
          toggleTheme={toggleTheme}
          isDark={isDark}
        />
      );
  }
};

function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Cargar preferencia de localStorage
    const saved = localStorage.getItem("theme");
    let initialTheme = true;
    try {
      initialTheme = saved ? JSON.parse(saved) : true;
    } catch {
      initialTheme = true;
    }
    return initialTheme;
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", JSON.stringify(newTheme));
      return newTheme;
    });
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <div className="App">
          <AuthApp toggleTheme={toggleTheme} isDark={isDark} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
