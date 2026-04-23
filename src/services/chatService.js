import api from "../lib/axios";

/**
 * Lấy lịch sử chat với một người dùng khác
 * GET /chat/history/{otherUserId}
 */
export const getChatHistory = (otherUserId) =>
  api.get(`/chat/history/${otherUserId}`);
