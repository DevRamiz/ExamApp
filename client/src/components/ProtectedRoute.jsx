import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function home(role) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/student";
}

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={home(user.role)} replace />;
  return children;
}
