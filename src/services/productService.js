import api from "../lib/axios";

// ─── Public ───────────────────────────────────────────────────
// GET /products  →  [{ id, name, description, price, stock, category, images }, ...]
export const getProductsApi = () => api.get("/products");

// GET /products/{id}
export const getProductByIdApi = (id) => api.get(`/products/${id}`);

// GET /products/search?keyword=&categoryId=&minPrice=&maxPrice=&page=&size=
export const searchProductsApi = (params) =>
  api.get("/products/search", { params });

// ─── Admin ────────────────────────────────────────────────────
// POST /admin/products  (multipart/form-data)
export const createProductApi = (formData) =>
  api.post("/admin/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// PUT /admin/products/{id}  (multipart/form-data)
export const updateProductApi = (id, formData) =>
  api.put(`/admin/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// DELETE /admin/products/{id}  →  { status, message }  (soft delete)
export const deleteProductApi = (id) => api.delete(`/admin/products/${id}`);
