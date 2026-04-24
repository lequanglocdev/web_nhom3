import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import {
  selectIsAuthenticated,
  selectUser,
  selectIsAdmin,
  clearAuth,
} from "../../store/authSlice";
import { logoutApi } from "../../services/authService";
import { getCart } from "../../services/cartService";
import { setUser } from "../../store/authSlice";
import api from "../../lib/axios";
export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);

  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Load cart count
  useEffect(() => {
    if (!isAuth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartCount(0);
      return;
    }

    const loadCart = () =>
      getCart()
        .then((res) => setCartCount(res.data?.items?.length || 0))
        .catch(() => {});

    loadCart(); // load lần đầu

    window.addEventListener("cart-updated", loadCart); // ✅ lắng nghe event
    return () => window.removeEventListener("cart-updated", loadCart);
  }, [isAuth]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Even if logout API fails, proceed to clear auth state
    }
    dispatch(clearAuth());
    navigate("/");
  };
  useEffect(() => {
    if (!isAuth || user?.fullName) return; // đã có rồi thì thôi

    api
      .get("/user/me")
      .then(({ data }) => dispatch(setUser(data)))
      .catch(() => {});
  }, [isAuth]); // eslint-disable-line
  return (
    <header
      className="pc-navbar"
      style={{
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
        transition: "box-shadow 0.3s",
      }}>
      <div className="pc-navbar__inner">
        {/* Logo */}
        <Link to="/" className="pc-navbar__logo">
          WEB<span>Shop</span>
        </Link>

        {/* Nav links */}
        <nav className="pc-navbar__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `pc-navbar__link${isActive ? " active" : ""}`
            }>
            Trang chủ
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `pc-navbar__link${isActive ? " active" : ""}`
            }>
            Sản phẩm
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              className="pc-navbar__link"
              style={{ color: "var(--yellow)" }}>
              ⚙️ Admin
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="pc-navbar__actions">
          {isAuth ? (
            <>
              {/* Cart */}
              <Link to="/cart" className="pc-navbar__cart-btn">
                🛒 Giỏ hàng
                {cartCount > 0 && (
                  <div className="pc-navbar__cart-badge">{cartCount}</div>
                )}
              </Link>

              {/* User dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  className="btn-ghost"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r)",
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => setMenuOpen((v) => !v)}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, var(--primary), var(--cyan))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "white",
                      flexShrink: 0,
                    }}>
                    {user?.fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      maxWidth: 90,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {user?.fullName || user?.email || "Tài khoản"}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-3)" }}>
                    ▾
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 99 }}
                      onClick={() => setMenuOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: 200,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-mid)",
                        borderRadius: "var(--r-lg)",
                        boxShadow: "var(--shadow-lg)",
                        overflow: "hidden",
                        zIndex: 100,
                        animation: "slideUpIn 0.2s ease",
                      }}>
                      <div
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--border)",
                        }}>
                        <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                          Đã đăng nhập
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginTop: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                          {user?.email}
                        </div>
                      </div>

                      {[
                        { icon: "👤", label: "Hồ sơ", to: "/user/profile" },
                        {
                          icon: "📦",
                          label: "Đơn hàng của tôi",
                          to: "/user/orders",
                        },
                        { icon: "🛒", label: "Giỏ hàng", to: "/cart" },
                      ].map((item, i) => (
                        <Link
                          key={i}
                          to={item.to}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "11px 16px",
                            fontSize: 14,
                            color: "var(--text-2)",
                            transition: "background 0.15s",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-surface)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          onClick={() => setMenuOpen(false)}>
                          <span>{item.icon}</span> {item.label}
                        </Link>
                      ))}

                      <div
                        style={{
                          borderTop: "1px solid var(--border)",
                          padding: "8px 8px",
                        }}>
                        <button
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            background: "transparent",
                            border: "none",
                            borderRadius: "var(--r-sm)",
                            color: "var(--red)",
                            fontSize: 14,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--red-bg)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          onClick={() => {
                            setMenuOpen(false);
                            handleLogout();
                          }}>
                          🚪 Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-secondary"
                style={{ padding: "9px 20px" }}>
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: "9px 20px" }}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
