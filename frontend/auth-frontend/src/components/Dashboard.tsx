import React, { Suspense, lazy } from "react";
import { useAuth } from "./AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";
import PageLoader from "./PageLoader";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const UserProfile = lazy(() => import("./UserProfile"));

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
      <Suspense fallback={<PageLoader />}>
        <AdminDashboard />
        <ChangePasswordModal
          open={user.requirePasswordChange === true}
          onPasswordChanged={handlePasswordChanged}
        />
      </Suspense>
    );
  }

  // Si es usuario normal, mostrar UserProfile a pantalla completa
  return (
    <Suspense fallback={<PageLoader />}>
      <UserProfile />
      <ChangePasswordModal
        open={user.requirePasswordChange === true}
        onPasswordChanged={handlePasswordChanged}
      />
    </Suspense>
  );
};

export default Dashboard;
