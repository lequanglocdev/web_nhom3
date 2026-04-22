/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import api from "../../lib/axios";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setUsers(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      showToast(
        "error",
        "Lỗi tải danh sách khách hàng: " + (err.message || "")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Open edit modal ────────────────────────────────────────
  const openEdit = (user) => {
    setEditTarget(user);
    setForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      address: user.address || "",
      isActive: user.isActive,
      isAdmin: user.isAdmin,
    });
  };

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/admin/users/${editTarget.id}`, {
        ...editTarget,
        ...form,
      });
      showToast("success", "Cập nhật thông tin thành công!");
      setEditTarget(null);
      fetchUsers();
    } catch (err) {
      showToast("error", err.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q);
    const matchRole =
      filterRole === "ALL"
        ? true
        : filterRole === "ADMIN"
        ? u.isAdmin
        : !u.isAdmin;
    return matchSearch && matchRole;
  });

  // ── Stats ──────────────────────────────────────────────────
  const total = users.length;
  const admins = users.filter((u) => u.isAdmin).length;
  const active = users.filter((u) => u.isActive).length;
  const verified = users.filter((u) => u.isVerified).length;

  // ══════════════════════════════════════════════════════════
  return (
    <div
      style={{
        padding: "28px 32px",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');`}</style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,.15)",
            background: toast.type === "error" ? "#fee2e2" : "#d1fae5",
            color: toast.type === "error" ? "#dc2626" : "#059669",
            animation: "slideIn .3s ease",
          }}>
          {toast.type === "error" ? "✗ " : "✓ "}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
          }}>
          Quản lý khách hàng
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Tổng {users.length} tài khoản
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 28,
        }}>
        {[
          { label: "Tổng tài khoản", value: total, color: "#6366f1" },
          { label: "Đang hoạt động", value: active, color: "#10b981" },
          { label: "Đã xác thực", value: verified, color: "#3b82f6" },
          { label: "Quản trị viên", value: admins, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,.06)",
              borderLeft: `4px solid ${color}`,
            }}>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}>
        <input
          placeholder="🔍  Tìm theo tên, email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 240,
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #e2e8f0",
            fontSize: 14,
            outline: "none",
            background: "#fff",
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #e2e8f0",
            fontSize: 14,
            background: "#fff",
            cursor: "pointer",
            outline: "none",
          }}>
          <option value="ALL">Tất cả vai trò</option>
          <option value="USER">Khách hàng</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 1px 6px rgba(0,0,0,.07)",
        }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>Không tìm
            thấy tài khoản nào
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "#",
                  "Khách hàng",
                  "Email",
                  "SĐT",
                  "Địa chỉ",
                  "Vai trò",
                  "Trạng thái",
                  "Xác thực",
                  "Hành động",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                      borderBottom: "1px solid #f1f5f9",
                    }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: i % 2 === 0 ? "#fff" : "#fafafa",
                  }}>
                  <td
                    style={{
                      padding: "13px 16px",
                      color: "#94a3b8",
                      fontSize: 13,
                    }}>
                    {i + 1}
                  </td>

                  {/* Avatar + tên */}
                  <td style={{ padding: "13px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: user.isAdmin ? "#fef3c7" : "#dbeafe",
                          color: user.isAdmin ? "#d97706" : "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}>
                        {(user.fullName || user.email || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#1e293b",
                          fontSize: 14,
                        }}>
                        {user.fullName || "—"}
                      </span>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "13px 16px",
                      fontSize: 13,
                      color: "#475569",
                    }}>
                    {user.email}
                  </td>
                  <td
                    style={{
                      padding: "13px 16px",
                      fontSize: 13,
                      color: "#64748b",
                    }}>
                    {user.phone || "—"}
                  </td>
                  <td
                    style={{
                      padding: "13px 16px",
                      fontSize: 13,
                      color: "#64748b",
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {user.address || "—"}
                  </td>

                  {/* Vai trò */}
                  <td style={{ padding: "13px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: user.isAdmin ? "#fef3c7" : "#f1f5f9",
                        color: user.isAdmin ? "#d97706" : "#64748b",
                      }}>
                      {user.isAdmin ? "⚙ Admin" : "👤 User"}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td style={{ padding: "13px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: user.isActive ? "#d1fae5" : "#fee2e2",
                        color: user.isActive ? "#059669" : "#dc2626",
                      }}>
                      {user.isActive ? "● Hoạt động" : "○ Đã khóa"}
                    </span>
                  </td>

                  {/* Xác thực */}
                  <td style={{ padding: "13px 16px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: user.isVerified ? "#dbeafe" : "#f1f5f9",
                        color: user.isVerified ? "#2563eb" : "#94a3b8",
                      }}>
                      {user.isVerified ? "✓ Đã xác thực" : "✗ Chưa xác thực"}
                    </span>
                  </td>

                  <td style={{ padding: "13px 16px" }}>
                    <button
                      onClick={() => openEdit(user)}
                      style={btnStyle("#3b82f6")}>
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal sửa ─────────────────────────────────────────── */}
      {editTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => !saving && setEditTarget(null)}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 500,
              padding: 32,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
            }}
            onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: editTarget.isAdmin ? "#fef3c7" : "#dbeafe",
                    color: editTarget.isAdmin ? "#d97706" : "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 18,
                  }}>
                  {(editTarget.fullName || editTarget.email || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                    Chỉnh sửa tài khoản
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                    {editTarget.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "#64748b",
                }}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Họ và tên">
                <input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fullName: e.target.value }))
                  }
                  disabled={saving}
                  placeholder="Nhập họ tên..."
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Số điện thoại">
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  disabled={saving}
                  placeholder="Nhập SĐT..."
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Địa chỉ">
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  disabled={saving}
                  placeholder="Nhập địa chỉ..."
                  style={inputStyle}
                />
              </FormField>

              {/* Toggles */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 4,
                }}>
                <ToggleField
                  label="Trạng thái tài khoản"
                  checked={form.isActive}
                  onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                  onLabel="Hoạt động"
                  offLabel="Đã khóa"
                  onColor="#10b981"
                  offColor="#ef4444"
                />
                <ToggleField
                  label="Vai trò"
                  checked={form.isAdmin}
                  onChange={(v) => setForm((f) => ({ ...f, isAdmin: v }))}
                  onLabel="Admin"
                  offLabel="User"
                  onColor="#f59e0b"
                  offColor="#6366f1"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setEditTarget(null)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  color: "#64748b",
                }}>
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: 11,
                  borderRadius: 10,
                  border: "none",
                  background: "#ff6b35",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                {saving ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        tr:hover td { background: #f0f9ff !important; }
        input:focus { border-color: #ff6b35 !important; outline: none; box-shadow: 0 0 0 3px rgba(255,107,53,.1); }
      `}</style>
    </div>
  );
}

// ── Sub components ─────────────────────────────────────────
function FormField({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
          display: "block",
        }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  onLabel,
  offLabel,
  onColor,
  offColor,
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: 12,
        padding: "12px 14px",
        border: "1.5px solid #f1f5f9",
      }}>
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 12,
          fontWeight: 600,
          color: "#64748b",
        }}>
        {label}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => onChange(true)}
          style={{
            flex: 1,
            padding: "7px 0",
            borderRadius: 8,
            border: "none",
            background: checked ? onColor : "#e2e8f0",
            color: checked ? "#fff" : "#94a3b8",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
            transition: "all .15s",
          }}>
          {onLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          style={{
            flex: 1,
            padding: "7px 0",
            borderRadius: 8,
            border: "none",
            background: !checked ? offColor : "#e2e8f0",
            color: !checked ? "#fff" : "#94a3b8",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
            transition: "all .15s",
          }}>
          {offLabel}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color .2s",
  fontFamily: "'Be Vietnam Pro', sans-serif",
};

function btnStyle(color) {
  return {
    padding: "5px 12px",
    borderRadius: 8,
    border: "none",
    background: color + "18",
    color,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  };
}
