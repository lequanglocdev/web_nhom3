import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth, selectUser } from "../../store/authSlice";
import { logoutApi } from "../../services/authService";
import AdminChat from "../../pages/admin/AdminChat";

const menuItems = [
  { path: "/admin/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { path: "/admin/users", icon: "bi-people", label: "Khách hàng" },
  { path: "/admin/categories", icon: "bi-tags", label: "Danh mục" },
  { path: "/admin/products", icon: "bi-box-seam", label: "Sản phẩm" },
  {
    path: "/admin/promotions",
    icon: "bi-ticket-perforated",
    label: "Khuyến mãi",
  },
  { path: "/admin/orders", icon: "bi-bag-check", label: "Đơn hàng" },
];

export default function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout error:", err);
    }
    dispatch(clearAuth());
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        style={{
          width: 240,
          background: "#1a1a2e",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}>
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#ff6b35" }}>
            ⚙ WebShop Admin
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 20px",
                color: isActive ? "#ff6b35" : "rgba(255,255,255,0.75)",
                background: isActive ? "rgba(255,107,53,0.12)" : "transparent",
                borderLeft: isActive
                  ? "3px solid #ff6b35"
                  : "3px solid transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s",
              })}>
              <i className={`bi ${item.icon}`} style={{ fontSize: 16 }} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
          {/* Avatar + tên */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#ff6b35",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
            </span>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                {user?.fullName || "Admin"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                Administrator
              </div>
            </div>
          </div>

          {/* Về trang chủ */}
          <NavLink
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              textDecoration: "none",
              marginBottom: 8,
            }}>
            <i className="bi bi-house" /> Về trang chủ
          </NavLink>

          {/* Đăng xuất */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              padding: 0,
              color: "#ff6b6b",
              fontSize: 13,
              cursor: "pointer",
              width: "100%",
            }}>
            <i className="bi bi-box-arrow-right" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {children}
      </main>
      <AdminChat />
    </div>
  );
}
