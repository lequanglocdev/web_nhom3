import api from "../lib/axios";

// POST /chatbot/ask  →  { answer: "...", timestamp: "..." }
export const askChatbotApi = (message) =>
  api.post("/chatbot/ask", { message });
