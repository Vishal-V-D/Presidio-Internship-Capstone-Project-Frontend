import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface PublicRouteProps {
  redirectToDashboard?: boolean;
}

export default function PublicRoute({
  redirectToDashboard = true,
}: PublicRouteProps) {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { user, loading } = auth;
33
  if (loading) return <div>Loading...</div>;

  // ✅ Extract actual role safely (handles nested user)
  const actualRole = user?.role?.toLowerCase();

  if (user && redirectToDashboard) {
    return (
      <Navigate
        to={actualRole === "organizer" ? "/organizer" : "/explore"}
        replace
      />
    );
  }

  return <Outlet />;
}
