import { useEffect, useState } from "react";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../services/categoryService";

const EMPTY_FORM = { name: "", description: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refetchKey, setRefetchKey] = useState(0);
  const triggerRefetch = () => setRefetchKey((k) => k + 1);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getCategoriesApi();
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setCategories(data);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Không thể tải danh mục.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [refetchKey]);

  // ── Modal thêm/sửa ────────────────────────────────────────
  const openAddModal = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditTarget(cat);
    setForm({ name: cat.name, description: cat.description ?? "" });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Tên danh mục không được để trống.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setSubmitting(true);
      if (editTarget) {
        await updateCategoryApi(
          editTarget.id,
          form.name.trim(),
          form.description.trim()
        );
        showToast("success", "Cập nhật danh mục thành công!");
      } else {
        await createCategoryApi(form.name.trim(), form.description.trim());
        showToast("success", "Thêm danh mục thành công!");
      }
      setShowModal(false);
      triggerRefetch();
    } catch (err) {
      const msg = err?.response?.data?.message || "Có lỗi xảy ra, thử lại sau.";
      setFormErrors({ api: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Xóa ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteCategoryApi(deleteTarget.id);
      showToast("success", `Đã xóa danh mục "${deleteTarget.name}".`);
      setDeleteTarget(null);
      triggerRefetch();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Xóa thất bại.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

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
            Quản lý danh mục
          </h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
            Tổng {categories.length} danh mục
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: "none",
            background: "#ff6b35",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}>
          + Thêm danh mục
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
          marginBottom: 28,
        }}>
        {[
          {
            label: "Tổng danh mục",
            value: categories.length,
            color: "#6366f1",
          },
          {
            label: "Có sản phẩm",
            value: categories.filter((c) => c.products?.length > 0).length,
            color: "#10b981",
          },
          {
            label: "Chưa có sản phẩm",
            value: categories.filter((c) => !c.products?.length).length,
            color: "#f59e0b",
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
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
            {error}
            <button
              onClick={triggerRefetch}
              style={{
                marginLeft: 12,
                padding: "6px 14px",
                borderRadius: 8,
                border: "1.5px solid #ef4444",
                background: "#fff",
                color: "#ef4444",
                cursor: "pointer",
                fontWeight: 600,
              }}>
              Thử lại
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>Chưa có danh
            mục nào
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["#", "Tên danh mục", "Mô tả", "Số sản phẩm", "Hành động"].map(
                  (h) => (
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: index % 2 === 0 ? "#fff" : "#fafafa",
                  }}>
                  <td
                    style={{
                      padding: "13px 16px",
                      color: "#94a3b8",
                      fontSize: 13,
                    }}>
                    {index + 1}
                  </td>
                  <td
                    style={{
                      padding: "13px 16px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: 14,
                    }}>
                    {cat.name}
                  </td>
                  <td
                    style={{
                      padding: "13px 16px",
                      color: "#64748b",
                      fontSize: 14,
                      maxWidth: 300,
                    }}>
                    {cat.description || (
                      <span style={{ fontStyle: "italic", color: "#cbd5e1" }}>
                        —
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          cat.products?.length > 0 ? "#dbeafe" : "#f1f5f9",
                        color: cat.products?.length > 0 ? "#2563eb" : "#94a3b8",
                      }}>
                      {cat.products?.length ?? 0} sản phẩm
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEditModal(cat)}
                        style={btnStyle("#3b82f6")}>
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        style={btnStyle("#ef4444")}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal thêm/sửa */}
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
          onClick={closeModal}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 480,
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
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                {editTarget ? "Sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button
                onClick={closeModal}
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

            <form onSubmit={handleSubmit}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {formErrors.api && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#fee2e2",
                      color: "#dc2626",
                      fontSize: 14,
                    }}>
                    {formErrors.api}
                  </div>
                )}
                <FormField label="Tên danh mục *">
                  <input
                    name="name"
                    type="text"
                    autoFocus
                    value={form.name}
                    onChange={handleFormChange}
                    disabled={submitting}
                    placeholder="VD: Laptop, Điện thoại..."
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.name ? "#ef4444" : "#e2e8f0",
                    }}
                  />
                  {formErrors.name && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 12,
                        margin: "4px 0 0",
                      }}>
                      {formErrors.name}
                    </p>
                  )}
                </FormField>

                <FormField label="Mô tả (tùy chọn)">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    disabled={submitting}
                    rows={3}
                    placeholder="Mô tả ngắn về danh mục..."
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </FormField>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
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
                  type="submit"
                  disabled={submitting}
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
                  {submitting
                    ? "Đang lưu..."
                    : editTarget
                    ? "Cập nhật"
                    : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteTarget && (
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
              Xóa danh mục?
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              Bạn có chắc muốn xóa danh mục{" "}
              <strong>"{deleteTarget.name}"</strong>?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
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
                onClick={handleDelete}
                disabled={deleting}
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
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        tr:hover td { background: #f0f9ff !important; }
        input:focus, textarea:focus { border-color: #ff6b35 !important; outline: none; box-shadow: 0 0 0 3px rgba(255,107,53,.1); }
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
