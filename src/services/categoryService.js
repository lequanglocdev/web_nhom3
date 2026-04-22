import api from "../lib/axios";

// ─── Public ───────────────────────────────────────────────────
// GET /categories  →  [{ id, name, description }, ...]
export const getCategoriesApi = () => api.get("/categories");

// ─── Admin ────────────────────────────────────────────────────
// POST /admin/categories  →  { status, message }
export const createCategoryApi = (name, description) =>
  api.post("/admin/categories", { name, description });

// PUT /admin/categories/{id}  →  { status, message }
export const updateCategoryApi = (id, name, description) =>
  api.put(`/admin/categories/${id}`, { name, description });

// DELETE /admin/categories/{id}  →  { status, message }  (soft delete)
export const deleteCategoryApi = (id) => api.delete(`/admin/categories/${id}`);
