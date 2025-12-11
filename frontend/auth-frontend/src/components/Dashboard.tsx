import React from "react";
import { useAuth } from "./AuthContext";
import AdminDashboard from "./AdminDashboard";
import UserProfile from "./UserProfile";
import ChangePasswordModal from "./ChangePasswordModal";

interface DashboardProps {
  toggleTheme: () => void;
  isDark: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleTheme, isDark }) => {
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
        <AdminDashboard toggleTheme={toggleTheme} isDark={isDark} />
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
      <UserProfile toggleTheme={toggleTheme} isDark={isDark} />
      <ChangePasswordModal
        open={user.requirePasswordChange === true}
        onPasswordChanged={handlePasswordChanged}
      />
    </>
  );
};

export default Dashboard;
