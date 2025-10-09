import React from "react";
import { useAuth } from "./AuthContext";
import AdminDashboard from "./AdminDashboard"; // Agregar import
import "./Auth.css";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h2>¡Bienvenido!</h2>
          <button onClick={logout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
        <div className="user-info">
          <h3>Información del Usuario:</h3>
          <div className="info-item">
            <strong>ID:</strong> {user.id}
          </div>
          <div className="info-item">
            <strong>Nombre:</strong> {user.name}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="info-item">
            <strong>Edad:</strong> {user.age} años
          </div>
          <div className="info-item">
            <strong>Rol:</strong> {user.role} {/* Agregar rol */}
          </div>
        </div>
        {user.role === "admin" && <AdminDashboard />}{" "}
        {/* Agregar condicional */}
        <div className="success-message">✅ Autenticación JWT exitosa</div>
      </div>
    </div>
  );
};

export default Dashboard;
