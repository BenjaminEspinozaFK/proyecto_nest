import React, { useState } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./App.css";

const AuthApp: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { user } = useAuth();

  // Si el usuario está logueado, mostrar dashboard
  if (user) {
    return <Dashboard />;
  }

  // Si no está logueado, mostrar login o register
  return (
    <>
      {isLoginMode ? (
        <Login onSwitchToRegister={() => setIsLoginMode(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLoginMode(true)} />
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AuthApp />
      </div>
    </AuthProvider>
  );
}

export default App;
