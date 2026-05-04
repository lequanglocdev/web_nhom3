import api from "../lib/axios";

const fmt = (date) => date.toISOString().split("T")[0]; // YYYY-MM-DD

export const dashboardAPI = {
  getSummary: (from, to) =>
    api.get("/admin/dashboard/summary", {
      params: { from: fmt(from), to: fmt(to) },
    }),

  getPaymentMethods: (from, to) =>
    api.get("/admin/dashboard/payment-methods", {
      params: { from: fmt(from), to: fmt(to) },
    }),

  getCategories: (from, to) =>
    api.get("/admin/dashboard/categories", {
      params: { from: fmt(from), to: fmt(to) },
    }),

  getTopProducts: (from, to, limit = 5) =>
    api.get("/admin/dashboard/top-products", {
      params: { from: fmt(from), to: fmt(to), limit },
    }),
};
