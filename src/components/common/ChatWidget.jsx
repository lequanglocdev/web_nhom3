import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Link } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectUser,
  selectAccessToken,
} from "../../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
const WS_URL = `${API_BASE}/ws`;
const SUPPORT_USER_ID = 1;

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchHistory(token, otherUserId) {
  const res = await fetch(`${API_BASE}/chat/history/${otherUserId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export default function ChatWidget() {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const token = useSelector(selectAccessToken);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unread, setUnread] = useState(0);

  const clientRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ FIX: dùng ref để tránh stale closure trong STOMP callback
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus + reset unread khi mở
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnread(0);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  // Connect WebSocket + load history
  useEffect(() => {
    if (!open || !isAuth || !token) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    // ✅ FIX: catch lỗi và hiện thông báo thay vì nuốt lỗi
    fetchHistory(token, SUPPORT_USER_ID)
      .then((hist) => {
        setMessages(
          hist.map((m) => ({
            id: m.id,
            text: m.content,
            time: m.timestamp,
            isMine: m.senderId !== SUPPORT_USER_ID,
          }))
        );
      })
      .catch((err) => {
        console.error("[Chat] Lỗi tải lịch sử:", err);
        setError("Không tải được lịch sử chat. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        stompClient.subscribe("/user/queue/messages", (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            setMessages((prev) => [
              ...prev,
              {
                id: msg.id || Date.now(),
                text: msg.content,
                time: msg.timestamp || new Date().toISOString(),
                isMine: msg.senderId !== SUPPORT_USER_ID,
              },
            ]);
            // ✅ FIX: đọc từ ref thay vì closure — luôn lấy giá trị mới nhất
            if (!openRef.current) setUnread((u) => u + 1);
          } catch (e) {
            console.error("[Chat] Parse error:", e);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error("[Chat] STOMP error:", frame);
        setConnected(false);
        setError("Mất kết nối. Đang thử kết nối lại...");
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [open, isAuth, token]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !connected || !clientRef.current) return;

    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ receiverId: SUPPORT_USER_ID, content: text }),
    });

    setInput("");
    inputRef.current?.focus();
  }, [input, connected]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-panel__header">
            <div className="chat-panel__avatar">💬</div>
            <div>
              <div className="chat-panel__title">Hỗ trợ trực tuyến</div>
              <div className="chat-panel__status">
                {connected
                  ? "Đang hoạt động"
                  : isAuth
                  ? "Đang kết nối..."
                  : "Chưa đăng nhập"}
              </div>
            </div>
            <button className="chat-panel__close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {!isAuth ? (
            <div className="chat-not-logged">
              <div className="chat-not-logged__icon">🔐</div>
              <p>Vui lòng đăng nhập để chat với hỗ trợ viên</p>
              <Link to="/login" className="btn-primary" onClick={() => setOpen(false)}>
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              <div className="chat-panel__messages">
                <div className="chat-msg chat-msg--in" style={{ maxWidth: "100%" }}>
                  <div
                    className="chat-msg__bubble"
                    style={{ background: "var(--bg-surface)", fontSize: 13 }}>
                    👋 Xin chào <strong>{user?.fullName || "bạn"}</strong>!
                    Chúng tôi có thể giúp gì cho bạn?
                  </div>
                </div>

                {/* ✅ FIX: hiện lỗi thay vì im lặng */}
                {error && (
                  <div style={{
                    color: "#e53e3e",
                    fontSize: 12,
                    padding: "8px 12px",
                    textAlign: "center"
                  }}>
                    {error}
                  </div>
                )}

                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
                    <div className="chat-loading">
                      <span /><span /><span />
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty">
                    <div className="chat-empty__icon">💭</div>
                    <div>Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện</div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={msg.id || i}
                      className={`chat-msg ${msg.isMine ? "chat-msg--out" : "chat-msg--in"}`}>
                      <div className="chat-msg__bubble">{msg.text}</div>
                      <div className="chat-msg__time">{formatTime(msg.time)}</div>
                    </div>
                  ))
                )}

                <div ref={bottomRef} />
              </div>

              <div className="chat-panel__input-area">
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!connected}
                  rows={1}
                  style={{ height: "auto", minHeight: 40 }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                  }}
                />
                <button
                  className="chat-send-btn"
                  onClick={sendMessage}
                  disabled={!connected || !input.trim()}
                  title="Gửi (Enter)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        className="chat-toggle-btn"
        onClick={() => setOpen((v) => !v)}
        title="Chat hỗ trợ">
        {!open && <div className="chat-ping" />}
        {!open && unread > 0 && (
          <div className="chat-badge">{unread > 9 ? "9+" : unread}</div>
        )}
        {open ? (
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
