import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "../../store/authSlice";
import api from "../../lib/axios";

export default function UserProfilePage() {
  const dispatch = useDispatch();
  const userRedux = useSelector(selectUser);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/user/me");
      setProfile(data);
      setForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    } catch (err) {
      showToast("Lỗi tải thông tin: " + (err.message || ""), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.fullName.trim()) {
      showToast("Vui lòng nhập họ tên", "error");
      return;
    }
    try {
      setSaving(true);
      await api.put("/user/me", form);
      dispatch(setUser({ ...userRedux, ...form })); // cập nhật Navbar
      await fetchProfile();
      setEditing(false);
      showToast("Cập nhật thông tin thành công!");
    } catch (err) {
      showToast(err.message || "Cập nhật thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      fullName: profile?.fullName || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    });
    setEditing(false);
  };

  const avatarLetter = (profile?.fullName || profile?.email || "U")
    .charAt(0)
    .toUpperCase();

  // ══════════════════════════════════════════════════════════
  if (loading)
    return (
      <div
        className="pc-container pc-section"
        style={{ textAlign: "center", padding: 80 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <p style={{ color: "var(--text-3)" }}>Đang tải thông tin...</p>
      </div>
    );

  return (
    <div className="pc-container pc-section">
      {/* Toast */}
      {toast && (
        <div className={`pc-toast pc-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Breadcrumb */}
      <div className="pc-breadcrumb" style={{ marginBottom: 28 }}>
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <span style={{ color: "var(--text-2)" }}>Hồ sơ của tôi</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 24,
          alignItems: "flex-start",
        }}>
        {/* ── LEFT: Avatar card ─────────────────────────────── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-mid)",
            borderRadius: 20,
            padding: 28,
            textAlign: "center",
          }}>
          {/* Avatar */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              margin: "0 auto 16px",
              background:
                "linear-gradient(135deg, var(--primary), var(--cyan))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}>
            {avatarLetter}
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "var(--text-1)",
              marginBottom: 4,
            }}>
            {profile?.fullName || "Chưa cập nhật"}
          </div>
          <div
            style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20 }}>
            {profile?.email}
          </div>

          {/* Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: profile?.isActive ? "#d1fae5" : "#fee2e2",
                color: profile?.isActive ? "#059669" : "#dc2626",
              }}>
              {profile?.isActive
                ? "● Tài khoản hoạt động"
                : "○ Tài khoản bị khóa"}
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: profile?.isVerified ? "#dbeafe" : "#f1f5f9",
                color: profile?.isVerified ? "#2563eb" : "#94a3b8",
              }}>
              {profile?.isVerified ? "✓ Đã xác thực email" : "✗ Chưa xác thực"}
            </div>
          </div>

          {/* Quick links */}
          <div
            style={{
              marginTop: 24,
              borderTop: "1px solid var(--border)",
              paddingTop: 20,
            }}>
            <Link
              to="/user/orders"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 10,
                background: "var(--bg-surface)",
                textDecoration: "none",
                color: "var(--text-2)",
                fontSize: 14,
                fontWeight: 500,
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--primary-glow)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-surface)")
              }>
              📦 Đơn hàng của tôi
            </Link>
            <Link
              to="/cart"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 10,
                marginTop: 8,
                background: "var(--bg-surface)",
                textDecoration: "none",
                color: "var(--text-2)",
                fontSize: 14,
                fontWeight: 500,
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--primary-glow)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-surface)")
              }>
              🛒 Giỏ hàng
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Info ───────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Thông tin cá nhân */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-mid)",
              borderRadius: 20,
              padding: 28,
            }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-1)",
                }}>
                Thông tin cá nhân
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 10,
                    border: "1.5px solid var(--primary)",
                    background: "transparent",
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}>
                  ✏️ Chỉnh sửa
                </button>
              )}
            </div>

            {editing ? (
              /* ── Edit mode ── */
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FormField label="Họ và tên *">
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    placeholder="Nguyễn Văn A"
                    disabled={saving}
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Số điện thoại">
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="0901234567"
                    disabled={saving}
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Địa chỉ">
                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    rows={3}
                    disabled={saving}
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </FormField>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border)",
                      background: "var(--bg-surface)",
                      color: "var(--text-2)",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                    }}>
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{
                      flex: 2,
                      padding: "11px",
                      fontSize: 14,
                    }}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}>
                {[
                  { icon: "👤", label: "Họ và tên", value: profile?.fullName },
                  { icon: "📧", label: "Email", value: profile?.email },
                  { icon: "📱", label: "Số điện thoại", value: profile?.phone },
                  { icon: "📍", label: "Địa chỉ", value: profile?.address },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: "var(--bg-surface)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      gridColumn: label === "Địa chỉ" ? "1 / -1" : "auto",
                    }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-3)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        marginBottom: 6,
                      }}>
                      {icon} {label}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: value ? "var(--text-1)" : "var(--text-3)",
                        fontWeight: 500,
                      }}>
                      {value || "Chưa cập nhật"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bảo mật tài khoản */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-mid)",
              borderRadius: 20,
              padding: 28,
            }}>
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-1)",
              }}>
              Bảo mật tài khoản
            </h2>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                background: "var(--bg-surface)",
                borderRadius: 12,
              }}>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "var(--text-1)",
                  }}>
                  Mật khẩu
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-3)",
                    marginTop: 2,
                  }}>
                  ••••••••••••
                </div>
              </div>
              <Link
                to="/forgot-password"
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: "none",
                }}>
                Đổi mật khẩu
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input:focus, textarea:focus {
          border-color: var(--primary) !important;
          outline: none;
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
      `}</style>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-2)",
          marginBottom: 6,
          display: "block",
        }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg-surface)",
  color: "var(--text-1)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color .2s",
};
