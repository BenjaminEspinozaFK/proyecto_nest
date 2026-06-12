import React, { useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { darkTheme, lightTheme } from "./theme";
import "./App.css";

type ViewType = "login" | "register" | "forgot" | "reset";

const AuthApp: React.FC = () => {
  const [view, setView] = useState<ViewType>("login");
  const { user } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("token")) {
      setView("reset");
    }
  }, []);

  if (user) {
    return <Dashboard />;
  }

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

const ThemedApp: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <div className="App">
          <AuthApp />
        </div>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
