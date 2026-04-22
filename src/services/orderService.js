import api from "../lib/axios";

// checkout
export const checkoutApi = (data) => api.post("/user/checkout", data);

// danh sách đơn
export const myOrders = () => api.get("/user/orders");

// chi tiết
export const orderDetail = (id) => api.get(`/user/orders/${id}`);

// huỷ đơn
export const cancelOrder = (id) => api.delete(`/user/orders/${id}/cancel`);
