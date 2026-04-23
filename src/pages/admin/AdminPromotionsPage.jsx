import { useEffect, useState } from "react";
import api from "../../lib/axios";

const EMPTY_FORM = {
  name: "",
  code: "",
  discountType: "PERCENT",
  discountValue: "",
  minOrderValue: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
};

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = tạo mới
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────
  const fetchPromos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/promotions");
      setPromos(data);
    } catch (err) {
      showToast("Lỗi tải khuyến mãi: " + (err.message || ""), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Open modal ─────────────────────────────────────────────
  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      name: p.name || "",
      code: p.code || "",
      discountType: p.discountType || "PERCENT",
      discountValue: p.discountValue ?? "",
      minOrderValue: p.minOrderValue ?? "",
      startDate: p.startDate || "",
      endDate: p.endDate || "",
      usageLimit: p.usageLimit ?? "",
    });
    setShowModal(true);
  };

  // ── Save (create / update) ─────────────────────────────────
  const handleSave = async () => {
    if (
      !form.name ||
      !form.code ||
      !form.discountValue ||
      !form.startDate ||
      !form.endDate
    ) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue || 0),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      };
      if (editItem) {
        await api.put(`/admin/promotions/${editItem.id}`, payload);
        showToast("Cập nhật mã khuyến mãi thành công");
      } else {
        await api.post("/admin/promotions", payload);
        showToast("Tạo mã khuyến mãi thành công");
      }
      setShowModal(false);
      fetchPromos();
    } catch (err) {
      showToast(err.message || "Lưu thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ──────────────────────────────────────────
  const handleToggle = async (p) => {
    try {
      await api.put(
        `/admin/promotions/${p.id}/${p.isActive ? "disable" : "enable"}`
      );
      showToast(p.isActive ? "Đã tắt mã" : "Đã bật mã");
      fetchPromos();
    } catch (err) {
      showToast(err.message || "Thao tác thất bại", "error");
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await api.delete(`/admin/promotions/${id}`);
      showToast("Đã xóa mã khuyến mãi");
      setConfirmDel(null);
      fetchPromos();
    } catch (err) {
      showToast(err.message || "Xóa thất bại", "error");
    } finally {
      setDeleting(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────
  const fmtDate = (d) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("vi-VN") : "—";
  const isExpired = (p) => p.endDate && new Date(p.endDate) < new Date();

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}>
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}>
            Quản lý khuyến mãi
          </h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
            Tổng {promos.length} mã khuyến mãi
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: "none",
            background: "#ff6b35",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
          + Tạo mã mới
        </button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
          marginBottom: 28,
        }}>
        {[
          {
            label: "Tổng mã",
            value: promos.length,
            color: "#6366f1",
            bg: "#eef2ff",
          },
          {
            label: "Đang hoạt động",
            value: promos.filter((p) => p.isActive && !isExpired(p)).length,
            color: "#10b981",
            bg: "#d1fae5",
          },
          {
            label: "Đã hết hạn / tắt",
            value: promos.filter((p) => !p.isActive || isExpired(p)).length,
            color: "#f59e0b",
            bg: "#fef3c7",
          },
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
        ) : promos.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>Chưa có mã
            khuyến mãi nào
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "Tên",
                  "Mã code",
                  "Loại",
                  "Giá trị",
                  "Đơn tối thiểu",
                  "Thời gian",
                  "Đã dùng",
                  "Trạng thái",
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
              {promos.map((p, i) => {
                const expired = isExpired(p);
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                    }}>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontWeight: 600,
                        color: "#1e293b",
                        fontSize: 14,
                      }}>
                      {p.name}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          background: "#f1f5f9",
                          color: "#475569",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: 13,
                          letterSpacing: 1,
                        }}>
                        {p.code}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13 }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background:
                            p.discountType === "PERCENT"
                              ? "#dbeafe"
                              : "#fce7f3",
                          color:
                            p.discountType === "PERCENT"
                              ? "#2563eb"
                              : "#db2777",
                        }}>
                        {p.discountType === "PERCENT" ? "%" : "VNĐ"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#ef4444",
                      }}>
                      {p.discountType === "PERCENT"
                        ? `${p.discountValue}%`
                        : Number(p.discountValue).toLocaleString("vi-VN") + "đ"}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#64748b",
                      }}>
                      {Number(p.minOrderValue || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        color: expired ? "#ef4444" : "#64748b",
                      }}>
                      {fmtDate(p.startDate)} → {fmtDate(p.endDate)}
                      {expired && (
                        <span style={{ marginLeft: 6, color: "#ef4444" }}>
                          ⚠ Hết hạn
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#64748b",
                      }}>
                      {p.usedCount || 0}
                      {p.usageLimit ? ` / ${p.usageLimit}` : ""}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        onClick={() => handleToggle(p)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          border: "none",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          background:
                            p.isActive && !expired ? "#d1fae5" : "#fee2e2",
                          color: p.isActive && !expired ? "#059669" : "#dc2626",
                        }}>
                        {p.isActive && !expired ? "● Đang bật" : "○ Đã tắt"}
                      </button>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(p)}
                          style={btnStyle("#3b82f6")}>
                          Sửa
                        </button>
                        <button
                          onClick={() => setConfirmDel(p)}
                          style={btnStyle("#ef4444")}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Tạo / Sửa ─────────────────────────────────── */}
      {showModal && (
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
          onClick={() => setShowModal(false)}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 32,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                {editItem ? "Sửa mã khuyến mãi" : "Tạo mã khuyến mãi mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FormField label="Tên chương trình *">
                <input
                  {...inputProps}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="VD: Sale hè 2025"
                />
              </FormField>

              <FormField label="Mã code *">
                <input
                  {...inputProps}
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="VD: SALE10"
                  style={{
                    ...inputStyle,
                    fontFamily: "monospace",
                    letterSpacing: 2,
                  }}
                />
              </FormField>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}>
                <FormField label="Loại giảm giá *">
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discountType: e.target.value }))
                    }
                    style={inputStyle}>
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                  </select>
                </FormField>

                <FormField
                  label={`Giá trị giảm ${
                    form.discountType === "PERCENT" ? "(%)" : "(VNĐ)"
                  } *`}>
                  <input
                    {...inputProps}
                    type="number"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discountValue: e.target.value }))
                    }
                    placeholder={
                      form.discountType === "PERCENT" ? "VD: 10" : "VD: 50000"
                    }
                  />
                </FormField>
              </div>

              <FormField label="Đơn hàng tối thiểu (VNĐ)">
                <input
                  {...inputProps}
                  type="number"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrderValue: e.target.value }))
                  }
                  placeholder="VD: 500000 (0 = không giới hạn)"
                />
              </FormField>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}>
                <FormField label="Ngày bắt đầu *">
                  <input
                    {...inputProps}
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                  />
                </FormField>
                <FormField label="Ngày kết thúc *">
                  <input
                    {...inputProps}
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                  />
                </FormField>
              </div>

              <FormField label="Giới hạn lượt dùng (để trống = không giới hạn)">
                <input
                  {...inputProps}
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, usageLimit: e.target.value }))
                  }
                  placeholder="VD: 100"
                />
              </FormField>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "11px",
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
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  background: "#ff6b35",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                {saving ? "Đang lưu..." : editItem ? "Cập nhật" : "Tạo mã"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ───────────────────────────────────── */}
      {confirmDel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: 20,
          }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
            }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>
              Xóa mã khuyến mãi?
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              Bạn có chắc muốn xóa mã <strong>{confirmDel.code}</strong>? Hành
              động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmDel(null)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDel.id)}
                disabled={deleting === confirmDel.id}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 10,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                {deleting === confirmDel.id ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        tr:hover td { background: #f0f9ff !important; }
        input:focus, select:focus { border-color: #ff6b35 !important; box-shadow: 0 0 0 3px rgba(255,107,53,.1); }
      `}</style>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────
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

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color .2s",
};

const inputProps = { style: inputStyle };

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
