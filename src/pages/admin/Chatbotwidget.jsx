// import { useState, useRef, useEffect } from "react";
// import { askChatbotApi } from "../../services/chatbotApi";

// const WELCOME_MESSAGE = {
//   id: 0,
//   role: "bot",
//   content:
//     "Xin chào! 👋 Tôi là PC Assistant — trợ lý AI của cửa hàng.\n\nTôi có thể giúp bạn:\n• Tìm kiếm sản phẩm theo tên, loại\n• So sánh giá và tình trạng hàng\n• Tra cứu mã khuyến mãi\n\nBạn cần tư vấn gì hôm nay?",
//   timestamp: new Date(),
// };

// export default function ChatbotWidget() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([WELCOME_MESSAGE]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);
//   const textareaRef = useRef(null);

//   // Auto-scroll khi có tin nhắn mới
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isTyping]);

//   // Focus vào input khi mở chat
//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => inputRef.current?.focus(), 320);
//     }
//   }, [isOpen]);

//   // Auto-resize textarea
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height =
//         Math.min(textareaRef.current.scrollHeight, 100) + "px";
//     }
//   }, [input]);

//   const sendMessage = async () => {
//     const trimmed = input.trim();
//     if (!trimmed || isTyping) return;

//     const userMsg = {
//       id: Date.now(),
//       role: "user",
//       content: trimmed,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");
//     setIsTyping(true);

//     try {
//       const res = await askChatbotApi(trimmed);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           role: "bot",
//           content: res.data.answer,
//           timestamp: new Date(),
//         },
//       ]);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           role: "bot",
//           content:
//             "Xin lỗi, có lỗi kết nối xảy ra. Vui lòng thử lại sau.",
//           timestamp: new Date(),
//         },
//       ]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const canSend = input.trim().length > 0 && !isTyping;

//   return (
//     <>
//       {/* ── Keyframes & Global Styles ─────────────────────── */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Noto+Sans:wght@400;500;600&display=swap');

//         @keyframes cb-pulse {
//           0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.5), 0 8px 32px rgba(0,0,0,0.4); }
//           60%       { box-shadow: 0 0 0 10px rgba(0, 212, 255, 0), 0 8px 32px rgba(0,0,0,0.4); }
//         }
//         @keyframes cb-slide-up {
//           from { opacity: 0; transform: translateY(24px) scale(0.94); }
//           to   { opacity: 1; transform: translateY(0)    scale(1);    }
//         }
//         @keyframes cb-fade-in {
//           from { opacity: 0; transform: translateY(10px); }
//           to   { opacity: 1; transform: translateY(0);   }
//         }
//         @keyframes cb-dot {
//           0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
//           30%            { transform: translateY(-6px); opacity: 1;   }
//         }
//         @keyframes cb-spin {
//           to { transform: rotate(360deg); }
//         }

//         .cb-toggle {
//           transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1) !important;
//         }
//         .cb-toggle:hover { transform: scale(1.1) !important; }

//         .cb-msg { animation: cb-fade-in 0.25s ease; }

//         .cb-input {
//           scrollbar-width: thin;
//           scrollbar-color: #1e293b transparent;
//         }
//         .cb-input:focus { outline: none !important; }
//         .cb-input::placeholder { color: #3d4f63 !important; }

//         .cb-messages {
//           scrollbar-width: thin;
//           scrollbar-color: #1e293b transparent;
//         }
//         .cb-messages::-webkit-scrollbar { width: 4px; }
//         .cb-messages::-webkit-scrollbar-track { background: transparent; }
//         .cb-messages::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }

//         .cb-send-btn {
//           transition: all 0.2s ease !important;
//         }
//         .cb-send-btn:hover:not(:disabled) {
//           transform: scale(1.06) !important;
//           box-shadow: 0 4px 20px rgba(0,212,255,0.5) !important;
//         }

//         .cb-chip {
//           transition: all 0.15s ease;
//           cursor: pointer;
//         }
//         .cb-chip:hover {
//           background: rgba(0,212,255,0.15) !important;
//           border-color: rgba(0,212,255,0.5) !important;
//           color: #00d4ff !important;
//         }
//       `}</style>

//       {/* ── Floating Toggle Button ─────────────────────────── */}
//       <button
//         className="cb-toggle"
//         onClick={() => setIsOpen((o) => !o)}
//         aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
//         style={{
//           position: "fixed",
//           bottom: 28,
//           right: 28,
//           width: 60,
//           height: 60,
//           borderRadius: "50%",
//           background: "linear-gradient(135deg, #0ea5e9 0%, #00d4ff 100%)",
//           border: "none",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           zIndex: 9999,
//           animation: isOpen ? "none" : "cb-pulse 2.8s infinite",
//           boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
//         }}
//       >
//         <div
//           style={{
//             transition: "transform 0.3s ease, opacity 0.2s ease",
//             transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
//             lineHeight: 0,
//           }}
//         >
//           {isOpen ? (
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M18 6L6 18M6 6l12 12"
//                 stroke="white"
//                 strokeWidth="2.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//           ) : (
//             <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
//               <path
//                 d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
//                 stroke="white"
//                 strokeWidth="2"
//                 strokeLinejoin="round"
//                 strokeLinecap="round"
//               />
//               <circle cx="8" cy="11" r="1" fill="white" />
//               <circle cx="12" cy="11" r="1" fill="white" />
//               <circle cx="16" cy="11" r="1" fill="white" />
//             </svg>
//           )}
//         </div>

//         {/* Unread badge — hiển thị khi chưa mở lần đầu */}
//         {!isOpen && messages.length <= 1 && (
//           <span
//             style={{
//               position: "absolute",
//               top: 4,
//               right: 4,
//               width: 12,
//               height: 12,
//               background: "#ef4444",
//               borderRadius: "50%",
//               border: "2px solid white",
//             }}
//           />
//         )}
//       </button>

//       {/* ── Chat Window ───────────────────────────────────── */}
//       {isOpen && (
//         <div
//           style={{
//             position: "fixed",
//             bottom: 102,
//             right: 28,
//             width: 390,
//             height: 560,
//             borderRadius: 20,
//             background: "#080e1a",
//             border: "1px solid rgba(0, 212, 255, 0.18)",
//             boxShadow:
//               "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden",
//             zIndex: 9998,
//             animation: "cb-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)",
//             fontFamily: "'Noto Sans', system-ui, sans-serif",
//           }}
//         >
//           {/* Header */}
//           <div
//             style={{
//               padding: "14px 18px",
//               background:
//                 "linear-gradient(180deg, #0f1829 0%, #0a1220 100%)",
//               borderBottom: "1px solid rgba(0, 212, 255, 0.12)",
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//               flexShrink: 0,
//             }}
//           >
//             {/* Bot Avatar */}
//             <div
//               style={{
//                 width: 42,
//                 height: 42,
//                 borderRadius: "50%",
//                 background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//                 boxShadow:
//                   "0 0 0 2px rgba(0,212,255,0.25), 0 0 16px rgba(0,212,255,0.3)",
//               }}
//             >
//               <svg
//                 width="22"
//                 height="22"
//                 viewBox="0 0 24 24"
//                 fill="none"
//               >
//                 <rect
//                   x="3"
//                   y="8"
//                   width="18"
//                   height="11"
//                   rx="3"
//                   fill="white"
//                   opacity="0.9"
//                 />
//                 <rect x="9" y="4" width="6" height="5" rx="1.5" fill="white" opacity="0.7" />
//                 <circle cx="8.5" cy="13.5" r="2" fill="#0369a1" />
//                 <circle cx="15.5" cy="13.5" r="2" fill="#0369a1" />
//                 <path
//                   d="M9.5 16.5 Q12 18 14.5 16.5"
//                   stroke="#0369a1"
//                   strokeWidth="1.2"
//                   strokeLinecap="round"
//                   fill="none"
//                 />
//                 <line x1="5" y1="10" x2="3" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
//                 <line x1="19" y1="10" x2="21" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
//               </svg>
//             </div>

//             <div style={{ flex: 1 }}>
//               <div
//                 style={{
//                   color: "#e2f4ff",
//                   fontWeight: 700,
//                   fontSize: 13,
//                   fontFamily: "'IBM Plex Mono', monospace",
//                   letterSpacing: "0.08em",
//                   lineHeight: 1,
//                 }}
//               >
//                 PC ASSISTANT
//               </div>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 6,
//                   marginTop: 5,
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 7,
//                     height: 7,
//                     borderRadius: "50%",
//                     background: "#22c55e",
//                     boxShadow: "0 0 8px #22c55e",
//                     flexShrink: 0,
//                   }}
//                 />
//                 <span
//                   style={{
//                     color: "#4d6680",
//                     fontSize: 11.5,
//                     fontFamily: "'IBM Plex Mono', monospace",
//                     letterSpacing: "0.02em",
//                   }}
//                 >
//                   Hoạt động · Phản hồi ngay
//                 </span>
//               </div>
//             </div>

//             {/* Clear & Close buttons */}
//             <div style={{ display: "flex", gap: 4 }}>
//               <button
//                 onClick={() => setMessages([WELCOME_MESSAGE])}
//                 title="Cuộc trò chuyện mới"
//                 style={{
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   padding: 6,
//                   color: "#334155",
//                   lineHeight: 0,
//                   borderRadius: 8,
//                   transition: "color 0.15s, background 0.15s",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.color = "#94a3b8";
//                   e.currentTarget.style.background = "rgba(255,255,255,0.05)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.color = "#334155";
//                   e.currentTarget.style.background = "none";
//                 }}
//               >
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                   <path
//                     d="M3 12a9 9 0 019-9 9 9 0 016.3 2.56L21 8M21 3v5h-5M21 12a9 9 0 01-9 9 9 9 0 01-6.3-2.56L3 16M3 21v-5h5"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </button>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   padding: 6,
//                   color: "#334155",
//                   lineHeight: 0,
//                   borderRadius: 8,
//                   transition: "color 0.15s, background 0.15s",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.color = "#94a3b8";
//                   e.currentTarget.style.background = "rgba(255,255,255,0.05)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.color = "#334155";
//                   e.currentTarget.style.background = "none";
//                 }}
//               >
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                   <path
//                     d="M18 6L6 18M6 6l12 12"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Messages Area */}
//           <div
//             className="cb-messages"
//             style={{
//               flex: 1,
//               overflowY: "auto",
//               padding: "18px 16px 8px",
//               display: "flex",
//               flexDirection: "column",
//               gap: 14,
//             }}
//           >
//             {messages.map((msg) => (
//               <div
//                 key={msg.id}
//                 className="cb-msg"
//                 style={{
//                   display: "flex",
//                   flexDirection:
//                     msg.role === "user" ? "row-reverse" : "row",
//                   alignItems: "flex-end",
//                   gap: 9,
//                 }}
//               >
//                 {/* Bot Avatar (small) */}
//                 {msg.role === "bot" && (
//                   <div
//                     style={{
//                       width: 30,
//                       height: 30,
//                       borderRadius: "50%",
//                       background:
//                         "linear-gradient(135deg, #0369a1, #0ea5e9)",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       flexShrink: 0,
//                       boxShadow: "0 0 10px rgba(0,212,255,0.25)",
//                     }}
//                   >
//                     <svg width="15" height="15" viewBox="0 0 24 24" fill="white" opacity="0.9">
//                       <rect x="3" y="8" width="18" height="11" rx="3"/>
//                       <rect x="9" y="4" width="6" height="5" rx="1.5" opacity="0.7"/>
//                     </svg>
//                   </div>
//                 )}

//                 {/* Message Bubble */}
//                 <div
//                   style={{
//                     maxWidth: "76%",
//                     padding: "10px 14px",
//                     borderRadius:
//                       msg.role === "user"
//                         ? "18px 18px 4px 18px"
//                         : "4px 18px 18px 18px",
//                     background:
//                       msg.role === "user"
//                         ? "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)"
//                         : "rgba(15, 28, 48, 0.95)",
//                     border:
//                       msg.role === "bot"
//                         ? "1px solid rgba(0,212,255,0.12)"
//                         : "none",
//                     color:
//                       msg.role === "user" ? "#f0f9ff" : "#94a3b8",
//                     fontSize: 13.5,
//                     lineHeight: 1.6,
//                     boxShadow:
//                       msg.role === "user"
//                         ? "0 4px 16px rgba(14,165,233,0.35)"
//                         : "0 2px 12px rgba(0,0,0,0.4)",
//                     whiteSpace: "pre-wrap",
//                     wordBreak: "break-word",
//                   }}
//                 >
//                   {msg.content}
//                   <div
//                     style={{
//                       fontSize: 10,
//                       marginTop: 5,
//                       color:
//                         msg.role === "user"
//                           ? "rgba(255,255,255,0.5)"
//                           : "#2d4a63",
//                       textAlign: msg.role === "user" ? "left" : "right",
//                       fontFamily: "'IBM Plex Mono', monospace",
//                     }}
//                   >
//                     {msg.timestamp.toLocaleTimeString("vi-VN", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {/* Typing Indicator */}
//             {isTyping && (
//               <div
//                 className="cb-msg"
//                 style={{ display: "flex", alignItems: "flex-end", gap: 9 }}
//               >
//                 <div
//                   style={{
//                     width: 30,
//                     height: 30,
//                     borderRadius: "50%",
//                     background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     flexShrink: 0,
//                     boxShadow: "0 0 10px rgba(0,212,255,0.25)",
//                   }}
//                 >
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="white" opacity="0.9">
//                     <rect x="3" y="8" width="18" height="11" rx="3"/>
//                     <rect x="9" y="4" width="6" height="5" rx="1.5" opacity="0.7"/>
//                   </svg>
//                 </div>
//                 <div
//                   style={{
//                     background: "rgba(15, 28, 48, 0.95)",
//                     border: "1px solid rgba(0,212,255,0.12)",
//                     borderRadius: "4px 18px 18px 18px",
//                     padding: "12px 18px",
//                     display: "flex",
//                     gap: 6,
//                     alignItems: "center",
//                     boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
//                   }}
//                 >
//                   {[0, 0.18, 0.36].map((delay, i) => (
//                     <div
//                       key={i}
//                       style={{
//                         width: 7,
//                         height: 7,
//                         borderRadius: "50%",
//                         background: "#00d4ff",
//                         boxShadow: "0 0 8px rgba(0,212,255,0.8)",
//                         animation: `cb-dot 1.3s ${delay}s infinite`,
//                       }}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Quick Suggestion Chips */}
//           {messages.length <= 1 && (
//             <div
//               style={{
//                 padding: "4px 16px 12px",
//                 display: "flex",
//                 gap: 6,
//                 flexWrap: "wrap",
//                 flexShrink: 0,
//               }}
//             >
//               {[
//                 "CPU Intel giá rẻ",
//                 "RAM DDR5 còn hàng",
//                 "Khuyến mãi hiện có",
//                 "Danh mục sản phẩm",
//               ].map((chip) => (
//                 <button
//                   key={chip}
//                   className="cb-chip"
//                   onClick={() => {
//                     setInput(chip);
//                     setTimeout(() => inputRef.current?.focus(), 50);
//                   }}
//                   style={{
//                     background: "rgba(0,212,255,0.06)",
//                     border: "1px solid rgba(0,212,255,0.2)",
//                     borderRadius: 20,
//                     padding: "5px 12px",
//                     color: "#4d8aaa",
//                     fontSize: 11.5,
//                     cursor: "pointer",
//                     fontFamily: "inherit",
//                   }}
//                 >
//                   {chip}
//                 </button>
//               ))}
//             </div>
//           )}

//           {/* Input Area */}
//           <div
//             style={{
//               padding: "12px 14px",
//               background: "rgba(8, 14, 26, 0.95)",
//               borderTop: "1px solid rgba(0, 212, 255, 0.1)",
//               display: "flex",
//               gap: 10,
//               alignItems: "flex-end",
//               flexShrink: 0,
//             }}
//           >
//             <textarea
//               ref={(el) => {
//                 inputRef.current = el;
//                 textareaRef.current = el;
//               }}
//               className="cb-input"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Nhập câu hỏi... (Enter gửi, Shift+Enter xuống dòng)"
//               rows={1}
//               style={{
//                 flex: 1,
//                 background: "rgba(15, 28, 48, 0.8)",
//                 border: "1px solid rgba(0, 212, 255, 0.18)",
//                 borderRadius: 14,
//                 padding: "10px 14px",
//                 color: "#cbd5e1",
//                 fontSize: 13.5,
//                 fontFamily: "'Noto Sans', sans-serif",
//                 resize: "none",
//                 maxHeight: 100,
//                 overflowY: "auto",
//                 lineHeight: 1.55,
//                 transition: "border-color 0.2s, box-shadow 0.2s",
//               }}
//               onFocus={(e) => {
//                 e.target.style.borderColor = "rgba(0,212,255,0.45)";
//                 e.target.style.boxShadow =
//                   "0 0 0 3px rgba(0,212,255,0.08)";
//               }}
//               onBlur={(e) => {
//                 e.target.style.borderColor = "rgba(0,212,255,0.18)";
//                 e.target.style.boxShadow = "none";
//               }}
//             />

//             {/* Send Button */}
//             <button
//               className="cb-send-btn"
//               onClick={sendMessage}
//               disabled={!canSend}
//               aria-label="Gửi tin nhắn"
//               style={{
//                 width: 44,
//                 height: 44,
//                 borderRadius: 14,
//                 background: canSend
//                   ? "linear-gradient(135deg, #0ea5e9, #00d4ff)"
//                   : "rgba(15,28,48,0.8)",
//                 border: canSend
//                   ? "none"
//                   : "1px solid rgba(0,212,255,0.1)",
//                 cursor: canSend ? "pointer" : "not-allowed",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//                 boxShadow: canSend
//                   ? "0 4px 16px rgba(0,212,255,0.3)"
//                   : "none",
//                 transition: "all 0.2s ease",
//               }}
//             >
//               {isTyping ? (
//                 <div
//                   style={{
//                     width: 16,
//                     height: 16,
//                     border: "2px solid rgba(0,212,255,0.3)",
//                     borderTopColor: "#00d4ff",
//                     borderRadius: "50%",
//                     animation: "cb-spin 0.8s linear infinite",
//                   }}
//                 />
//               ) : (
//                 <svg
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                 >
//                   <path
//                     d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
//                     stroke={canSend ? "white" : "#1e3a4a"}
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
