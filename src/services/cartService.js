import api from "../lib/axios";

// lấy giỏ hàng
export const getCart = () => api.get("/user/cart");

// thêm vào giỏ
export const addToCart = (data) => api.post("/user/cart/add", data);

// update số lượng
export const updateCart = (data) => api.put("/user/cart/update", data);

// xoá item
export const removeItem = (id) => api.delete(`/user/cart/remove/${id}`);

// clear cart
export const clearCart = () => api.delete("/user/cart/clear");

export const refreshCartEvent = () =>
  window.dispatchEvent(new Event("cart-updated"));


// apply mã
export const applyPromo = (code) =>
  api.post("/user/cart/apply-promo", { code });
