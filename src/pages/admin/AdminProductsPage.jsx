import { useEffect, useState, useRef } from "react";
import {
  searchProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "../../services/productService";
import { getCategoriesApi } from "../../services/categoryService";

const EMPTY_FORM = { name: "", description: "", price: "", stock: "", categoryId: "" };
const PAGE_SIZE = 10;
const formatVND = (v) => Number(v).toLocaleString("vi-VN") + " đ";

export default function AdminProductsPage() {
  const [products, setProducts]     = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [keyword, setKeyword]               = useState("");
  const [filterCategoryId, setFilterCatId]  = useState("");
  const [minPrice, setMinPrice]             = useState("");
  const [maxPrice, setMaxPrice]             = useState("");

  const [categories, setCategories] = useState([]);
  const [refetchKey, setRefetchKey] = useState(0);
  const triggerRefetch = () => setRefetchKey((k) => k + 1);

  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls]     = useState([]);
  const fileInputRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [lightboxUrl, setLightboxUrl]   = useState(null);
  const [toast, setToast]               = useState(null);

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load categories ────────────────────────────────────────
  useEffect(() => {
    getCategoriesApi()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setCategories(data);
      })
      .catch(() => {});
  }, []);

  // ── Load products ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, size: PAGE_SIZE };
        if (keyword.trim()) params.keyword = keyword.trim();
        if (filterCategoryId) params.categoryId = filterCategoryId;
        if (minPrice !== "") params.minPrice = minPrice;
        if (maxPrice !== "") params.maxPrice = maxPrice;

        const res = await searchProductsApi(params);
        if (cancelled) return;
        const data = res.data;
        setProducts(data.products ?? []);
        setTotalPages(data.totalPages ?? 0);
        setTotalItems(data.totalItems ?? 0);
        setCurrentPage(data.currentPage ?? 0);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Không thể tải sản phẩm.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchKey, currentPage]);

  // ── Search ────────────────────────────────────────────────
  const handleSearch = (e) => { e.preventDefault(); setCurrentPage(0); triggerRefetch(); };
  const handleReset  = () => {
    setKeyword(""); setFilterCatId(""); setMinPrice(""); setMaxPrice("");
    setCurrentPage(0); setRefetchKey((k) => k + 1);
  };

  // ── Modal ─────────────────────────────────────────────────
  const openAddModal = () => {
    setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({});
    setSelectedFiles([]); setPreviewUrls([]); setShowModal(true);
  };
  const openEditModal = (p) => {
    setEditTarget(p);
    setForm({ name: p.name ?? "", description: p.description ?? "", price: p.price ?? "", stock: p.stock ?? "", categoryId: p.category?.id ?? "" });
    setFormErrors({}); setSelectedFiles([]); setPreviewUrls([]); setShowModal(true);
  };
  const closeModal = () => {
    if (submitting) return;
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (!newFiles.length) return;
    e.target.value = "";
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removePreview = (i) => {
    URL.revokeObjectURL(previewUrls[i]);
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviewUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Tên sản phẩm không được để trống.";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errors.price = "Giá phải là số dương.";
    if (form.stock === "" || isNaN(form.stock) || Number(form.stock) < 0) errors.stock = "Số lượng không hợp lệ.";
    if (!editTarget && !form.categoryId) errors.categoryId = "Vui lòng chọn danh mục.";
    if (!editTarget && selectedFiles.length === 0) errors.files = "Vui lòng chọn ít nhất 1 ảnh.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("price", form.price);
    fd.append("stock", form.stock);
    if (!editTarget) fd.append("categoryId", form.categoryId);
    selectedFiles.forEach((f) => fd.append("files", f));
    try {
      setSubmitting(true);
      if (editTarget) {
        await updateProductApi(editTarget.id, fd);
        showToast("success", "Cập nhật sản phẩm thành công!");
      } else {
        await createProductApi(fd);
        showToast("success", "Thêm sản phẩm thành công!");
      }
      setShowModal(false); setCurrentPage(0); triggerRefetch();
    } catch (err) {
      setFormErrors({ api: err?.response?.data?.message || "Có lỗi xảy ra." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteProductApi(deleteTarget.id);
      showToast("success", `Đã xóa sản phẩm "${deleteTarget.name}".`);
      setDeleteTarget(null); triggerRefetch();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Xóa thất bại.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');`}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,.15)",
          background: toast.type === "error" ? "#fee2e2" : "#d1fae5",
          color: toast.type === "error" ? "#dc2626" : "#059669",
          animation: "slideIn .3s ease",
        }}>
          {toast.type === "error" ? "✗ " : "✓ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>Quản lý sản phẩm</h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Tổng {totalItems} sản phẩm</p>
        </div>
        <button onClick={openAddModal} style={{
          padding: "10px 22px", borderRadius: 10, border: "none",
          background: "#ff6b35", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}>+ Thêm sản phẩm</button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{
        background: "#fff", borderRadius: 14, padding: "18px 20px",
        marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end",
      }}>
        <div style={{ flex: "2 1 200px" }}>
          <label style={labelStyle}>Từ khóa</label>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..." style={inputStyle} />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={labelStyle}>Danh mục</label>
          <select value={filterCategoryId} onChange={(e) => setFilterCatId(e.target.value)} style={inputStyle}>
            <option value="">Tất cả</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: "1 1 120px" }}>
          <label style={labelStyle}>Giá từ (đ)</label>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0" min="0" style={inputStyle} />
        </div>
        <div style={{ flex: "1 1 120px" }}>
          <label style={labelStyle}>Giá đến (đ)</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="∞" min="0" style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: "#0f172a", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>Tìm</button>
          <button type="button" onClick={handleReset} style={{
            padding: "10px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0",
            background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#64748b",
          }}>Reset</button>
        </div>
      </form>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,.07)" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Đang tải...
          </div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
            {error}
            <button onClick={triggerRefetch} style={{
              marginLeft: 12, padding: "6px 14px", borderRadius: 8,
              border: "1.5px solid #ef4444", background: "#fff",
              color: "#ef4444", cursor: "pointer", fontWeight: 600,
            }}>Thử lại</button>
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>Không có sản phẩm nào
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["#", "Ảnh", "Tên sản phẩm", "Danh mục", "Giá", "Tồn kho", "Hành động"].map((h) => (
                    <th key={h} style={{
                      padding: "13px 16px", textAlign: "left", fontSize: 12,
                      fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                      letterSpacing: ".5px", borderBottom: "1px solid #f1f5f9",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => {
                  const images = item.images ?? item.productImages ?? [];
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", background: index % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "13px 16px", color: "#94a3b8", fontSize: 13 }}>
                        {currentPage * PAGE_SIZE + index + 1}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {images.slice(0, 3).map((img, i) => (
                            <img key={i} src={img.imageUrl} alt=""
                              onClick={() => setLightboxUrl(img.imageUrl)}
                              style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid #f1f5f9" }}
                            />
                          ))}
                          {images.length > 3 && (
                            <div style={{
                              width: 40, height: 40, borderRadius: 8,
                              background: "#f1f5f9", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: 11, color: "#64748b", fontWeight: 600,
                            }}>+{images.length - 3}</div>
                          )}
                          {images.length === 0 && (
                            <div style={{
                              width: 40, height: 40, borderRadius: 8,
                              background: "#f1f5f9", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: 18,
                            }}>📷</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{item.name}</div>
                        {item.description && (
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: "#dbeafe", color: "#2563eb",
                        }}>
                          {item.category?.name ?? item.categoryName ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", fontWeight: 600, color: "#0f172a", fontSize: 14 }}>
                        {formatVND(item.price)}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: item.stock > 10 ? "#d1fae5" : item.stock > 0 ? "#fef3c7" : "#fee2e2",
                          color: item.stock > 10 ? "#059669" : item.stock > 0 ? "#d97706" : "#dc2626",
                        }}>
                          {item.stock}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEditModal(item)} style={btnStyle("#3b82f6")}>Sửa</button>
                          <button onClick={() => setDeleteTarget(item)} style={btnStyle("#ef4444")}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          <PagBtn disabled={currentPage === 0} onClick={() => { setCurrentPage((p) => p - 1); triggerRefetch(); }}>‹</PagBtn>
          {Array.from({ length: totalPages }, (_, i) => (
            <PagBtn key={i} active={i === currentPage} onClick={() => { setCurrentPage(i); triggerRefetch(); }}>{i + 1}</PagBtn>
          ))}
          <PagBtn disabled={currentPage === totalPages - 1} onClick={() => { setCurrentPage((p) => p + 1); triggerRefetch(); }}>›</PagBtn>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div onClick={() => setLightboxUrl(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.8)",
          zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out",
        }}>
          <img src={lightboxUrl} alt="preview" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, boxShadow: "0 8px 40px rgba(0,0,0,.6)" }} />
        </div>
      )}

      {/* Modal thêm/sửa */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }} onClick={closeModal}>
          <div style={{
            background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560,
            maxHeight: "90vh", overflowY: "auto", padding: 32,
            boxShadow: "0 20px 60px rgba(0,0,0,.25)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                {editTarget ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {formErrors.api && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fee2e2", color: "#dc2626", fontSize: 14 }}>
                    {formErrors.api}
                  </div>
                )}

                <FormField label="Tên sản phẩm *">
                  <input name="name" autoFocus value={form.name} onChange={handleFormChange} disabled={submitting}
                    placeholder="VD: MacBook Pro M3" style={{ ...inputStyle, borderColor: formErrors.name ? "#ef4444" : "#e2e8f0" }} />
                  {formErrors.name && <ErrMsg>{formErrors.name}</ErrMsg>}
                </FormField>

                <FormField label="Mô tả (tùy chọn)">
                  <textarea name="description" value={form.description} onChange={handleFormChange} disabled={submitting}
                    rows={3} placeholder="Mô tả ngắn..." style={{ ...inputStyle, resize: "none" }} />
                </FormField>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FormField label="Giá (đ) *">
                    <input name="price" type="number" value={form.price} onChange={handleFormChange} disabled={submitting}
                      placeholder="VD: 29000000" min="1"
                      style={{ ...inputStyle, borderColor: formErrors.price ? "#ef4444" : "#e2e8f0" }} />
                    {formErrors.price && <ErrMsg>{formErrors.price}</ErrMsg>}
                  </FormField>
                  <FormField label="Tồn kho *">
                    <input name="stock" type="number" value={form.stock} onChange={handleFormChange} disabled={submitting}
                      placeholder="VD: 15" min="0"
                      style={{ ...inputStyle, borderColor: formErrors.stock ? "#ef4444" : "#e2e8f0" }} />
                    {formErrors.stock && <ErrMsg>{formErrors.stock}</ErrMsg>}
                  </FormField>
                </div>

                {!editTarget && (
                  <FormField label="Danh mục *">
                    <select name="categoryId" value={form.categoryId} onChange={handleFormChange} disabled={submitting}
                      style={{ ...inputStyle, borderColor: formErrors.categoryId ? "#ef4444" : "#e2e8f0" }}>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {formErrors.categoryId && <ErrMsg>{formErrors.categoryId}</ErrMsg>}
                  </FormField>
                )}

                {/* Ảnh hiện tại (edit mode) */}
                {editTarget && (editTarget.images || editTarget.productImages)?.length > 0 && (
                  <FormField label="Ảnh hiện tại">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(editTarget.images || editTarget.productImages).map((img, i) => (
                        <img key={i} src={img.imageUrl} alt="" onClick={() => setLightboxUrl(img.imageUrl)}
                          style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer" }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Chọn file mới để thêm ảnh (không xóa ảnh cũ).</p>
                  </FormField>
                )}

                {/* Upload ảnh */}
                <FormField label={editTarget ? "Thêm ảnh mới (tùy chọn)" : "Ảnh sản phẩm *"}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${formErrors.files ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 12, padding: 16, textAlign: "center",
                      cursor: "pointer", background: "#fafafa", transition: "border-color .2s",
                    }}>
                    <input ref={fileInputRef} type="file" multiple accept="image/*"
                      style={{ display: "none" }} onChange={handleFileChange} disabled={submitting} />
                    {previewUrls.length === 0 ? (
                      <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>📁 Nhấn để chọn ảnh (có thể chọn nhiều)</p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                        {previewUrls.map((url, i) => (
                          <div key={i} style={{ position: "relative" }}>
                            <img src={url} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "2px solid #ff6b35" }} />
                            <button type="button" onClick={(e) => { e.stopPropagation(); removePreview(i); }}
                              style={{
                                position: "absolute", top: -6, right: -6,
                                background: "#ef4444", color: "#fff", border: "none",
                                borderRadius: "50%", width: 20, height: 20,
                                fontSize: 11, cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center",
                              }}>✕</button>
                          </div>
                        ))}
                        <div style={{
                          width: 72, height: 72, border: "2px dashed #cbd5e1",
                          borderRadius: 8, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 24, color: "#cbd5e1",
                        }}>+</div>
                      </div>
                    )}
                  </div>
                  {formErrors.files && <ErrMsg>{formErrors.files}</ErrMsg>}
                </FormField>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button type="button" onClick={closeModal} disabled={submitting} style={{
                  flex: 1, padding: 11, borderRadius: 10, border: "1.5px solid #e2e8f0",
                  background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#64748b",
                }}>Hủy</button>
                <button type="submit" disabled={submitting} style={{
                  flex: 2, padding: 11, borderRadius: 10, border: "none",
                  background: "#ff6b35", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}>
                  {submitting ? "Đang lưu..." : editTarget ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteTarget && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1001, padding: 20,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 28,
            maxWidth: 380, width: "100%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,.25)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Xóa sản phẩm?</h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              Bạn có chắc muốn xóa <strong>"{deleteTarget.name}"</strong>?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} style={{
                flex: 1, padding: 10, borderRadius: 10, border: "1.5px solid #e2e8f0",
                background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>Hủy</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, padding: 10, borderRadius: 10, border: "none",
                background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
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
        input:focus, select:focus, textarea:focus { border-color: #ff6b35 !important; outline: none; box-shadow: 0 0 0 3px rgba(255,107,53,.1); }
      `}</style>
    </div>
  );
}

// ── Small components ───────────────────────────────────────
function FormField({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>{label}</label>
      {children}
    </div>
  );
}

function ErrMsg({ children }) {
  return <p style={{ color: "#ef4444", fontSize: 12, margin: "4px 0 0" }}>{children}</p>;
}

function PagBtn({ children, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 36, height: 36, borderRadius: 8, border: active ? "none" : "1.5px solid #e2e8f0",
      background: active ? "#ff6b35" : "#fff", color: active ? "#fff" : disabled ? "#cbd5e1" : "#374151",
      fontWeight: 600, fontSize: 14, cursor: disabled ? "default" : "pointer",
    }}>{children}</button>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14,
  background: "#fff", boxSizing: "border-box",
  transition: "border-color .2s", fontFamily: "'Be Vietnam Pro', sans-serif",
};

const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" };

function btnStyle(color) {
  return {
    padding: "5px 12px", borderRadius: 8, border: "none",
    background: color + "18", color, fontWeight: 600, fontSize: 12, cursor: "pointer",
  };
}
