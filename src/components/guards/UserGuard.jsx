// src/components/guards/UserGuard.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectIsAuthenticated, selectIsAdmin } from "../../store/authSlice";

export default function UserGuard({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ✅ Admin không được vào trang user
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return children;
}
