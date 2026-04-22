import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
  selectRole,
  clearAuth,
} from "../../store/authSlice";
import { logoutApi } from "../../services/authService";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  const handleLogout = async () => {
    try {
      await logoutApi(); // Hủy refreshToken phía server
    } catch {
      // Dù server lỗi vẫn xóa local
    } finally {
      dispatch(clearAuth());
      navigate("/login");
    }
  };

  // Lấy chữ cái đầu để hiển thị avatar
  const avatarLetter = user?.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="logo-box">W</div>
          <span className="brand-text">WebShop</span>
        </Link>

        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto ms-lg-4">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Trang chủ
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/products">
                Sản phẩm
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/cart">
                Giỏ hàng
              </NavLink>
            </li>
            {/* Link Admin nếu là ADMIN */}
            {role === "ADMIN" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/dashboard">
                  Quản trị
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex gap-2 mt-3 mt-lg-0 align-items-center">
            {isAuthenticated ? (
              /* ── Đã đăng nhập: hiển thị dropdown ── */
              <div className="dropdown">
                <button
                  className="btn d-flex align-items-center gap-2 nav-btn-user"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    color: "inherit",
                    cursor: "pointer",
                  }}>
                  {/* Avatar */}
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#4f8ef7",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}>
                    {avatarLetter}
                  </span>
                  <span className="d-none d-lg-inline">
                    {user?.fullName || "Tài khoản"}
                  </span>
                  <i className="bi bi-chevron-down" style={{ fontSize: 12 }} />
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  {/* Thông tin user */}
                  <li className="dropdown-header px-3 py-2">
                    <div className="fw-semibold">
                      {user?.fullName || "Người dùng"}
                    </div>
                    <div className="text-muted small">{user?.email}</div>
                  </li>
                  <li>
                    <hr className="dropdown-divider my-1" />
                  </li>

                  {/* Cập nhật thông tin */}
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center gap-2"
                      to="/profile">
                      <i className="bi bi-person-circle" />
                      Thông tin cá nhân
                    </Link>
                  </li>

                  {/* Đơn hàng của tôi */}
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center gap-2"
                      to="/orders">
                      <i className="bi bi-bag-check" />
                      Đơn hàng của tôi
                    </Link>
                  </li>

                  {/* Admin panel nếu là ADMIN */}
                  {role === "ADMIN" && (
                    <li>
                      <Link
                        className="dropdown-item d-flex align-items-center gap-2"
                        to="/admin/dashboard">
                        <i className="bi bi-speedometer2" />
                        Trang quản trị
                      </Link>
                    </li>
                  )}

                  <li>
                    <hr className="dropdown-divider my-1" />
                  </li>

                  {/* Đăng xuất */}
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 text-danger"
                      onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right" />
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              /* ── Chưa đăng nhập ── */
              <>
                <Link className="btn nav-btn-login" to="/login">
                  Đăng nhập
                </Link>
                <Link className="btn nav-btn-register" to="/register">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
