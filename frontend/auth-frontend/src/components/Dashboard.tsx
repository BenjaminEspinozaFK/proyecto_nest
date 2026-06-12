import React from "react";
import { useAuth } from "./AuthContext";
import AdminDashboard from "./AdminDashboard";
import UserProfile from "./UserProfile";
import ChangePasswordModal from "./ChangePasswordModal";

const Dashboard: React.FC = () => {
  const { user, setUser } = useAuth();

  if (!user) {
    return null;
  }

  const handlePasswordChanged = () => {
    // Actualizar el estado del usuario para quitar el flag
    if (user) {
      setUser({ ...user, requirePasswordChange: false });
    }
  };

  // Si es admin, mostrar AdminDashboard directamente a pantalla completa
  if (user.role === "admin") {
    return (
      <>
        <AdminDashboard />
        <ChangePasswordModal
          open={user.requirePasswordChange === true}
          onPasswordChanged={handlePasswordChanged}
        />
      </>
    );
  }

  // Si es usuario normal, mostrar UserProfile a pantalla completa
  return (
    <>
      <UserProfile />
      <ChangePasswordModal
        open={user.requirePasswordChange === true}
        onPasswordChanged={handlePasswordChanged}
      />
    </>
  );
};

export default Dashboard;
