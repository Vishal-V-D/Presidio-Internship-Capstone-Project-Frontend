import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  role?: "organizer" | "contestant";
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { user, loading } = auth;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500" />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  // ✅ Extract actual role safely (handles nested user)
  const actualRole = user?.role?.toLowerCase();

  // ✅ Debug log
  console.log("✅ Checking role:", { expected: role, actual: actualRole });

  // ✅ Compare lowercase roles
  if (role && actualRole !== role.toLowerCase()) {
    console.log("🚫 Role mismatch. Redirecting...");
    return (
      <Navigate
        to={actualRole === "organizer" ? "/organizer" : "/explore"}
        replace
      />
    );
  }

  return <Outlet />;
}
