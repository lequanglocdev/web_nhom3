// src/components/guards/AdminGuard.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectIsAuthenticated, selectIsAdmin } from "../../store/authSlice";
import AdminLayout from "../layout/AdminLayout";

export default function AdminGuard({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <AdminLayout>{children}</AdminLayout>;
}
