import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { selectAccessToken } from "../../store/authSlice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
const WS_URL = `${API_BASE}/ws`;

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

async function fetchAllUsers(token) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.data || data || []).filter((u) => !u.isAdmin);
}

export default function AdminChat() {
  const token = useSelector(selectAccessToken);

  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadMap, setUnreadMap] = useState({});
  const [newUserMap, setNewUserMap] = useState({});

  const clientRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);
  const openRef = useRef(open);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (open && selectedUser) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, selectedUser]);

  // Load danh sách user
  useEffect(() => {
    if (!token) return;
    fetchAllUsers(token).then(setUsers).catch(console.error);
  }, [token]);

  // Kết nối WebSocket 1 lần
  useEffect(() => {
    if (!token) return;

    const stomp = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        stomp.subscribe("/user/queue/messages", (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            const isCurrentChat = selectedUserRef.current?.id === msg.senderId;

            if (isCurrentChat) {
              setMessages((prev) => [
                ...prev,
                {
                  id: msg.id || Date.now(),
                  text: msg.content,
                  time: msg.timestamp,
                  isMine: false,
                },
              ]);
            } else {
              // Tăng unread
              setUnreadMap((prev) => ({
                ...prev,
                [msg.senderId]: (prev[msg.senderId] || 0) + 1,
              }));
              // Thêm vào danh sách nếu chưa có
              setUsers((prev) => {
                if (prev.find((u) => u.id === msg.senderId)) return prev;
                const newUser = {
                  id: msg.senderId,
                  fullName: msg.senderName || `User #${msg.senderId}`,
                  email: "",
                };
                setNewUserMap((m) => ({ ...m, [msg.senderId]: true }));
                return [newUser, ...prev];
              });
            }
          } catch (e) {
            console.error(e);
          }
        });
      },
      onDisconnect: () => setConnected(false),
    });

    stomp.activate();
    clientRef.current = stomp;
    return () => {
      stomp.deactivate();
      clientRef.current = null;
    };
  }, [token]);

  const selectUser = useCallback(
    async (user) => {
      setSelectedUser(user);
      setMessages([]);
      setLoading(true);
      setUnreadMap((prev) => ({ ...prev, [user.id]: 0 }));
      setNewUserMap((prev) => ({ ...prev, [user.id]: false }));
      try {
        const hist = await fetchHistory(token, user.id);
        setMessages(
          hist.map((m) => ({
            id: m.id,
            text: m.content,
            time: m.timestamp,
            isMine: m.receiverId === user.id,
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !connected || !clientRef.current || !selectedUser) return;

    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ receiverId: selectedUser.id, content: text }),
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        time: new Date().toISOString(),
        isMine: true,
      },
    ]);
    setInput("");
    inputRef.current?.focus();
  }, [input, connected, selectedUser]);

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ── Floating panel ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 24,
            zIndex: 9999,
            width: 680,
            height: 520,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}>
          {/* Header */}
          <div
            style={{
              background: "#1a1a2e",
              color: "#fff",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>💬</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Hỗ trợ khách hàng
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: connected ? "#4ade80" : "#f87171",
                    marginTop: 1,
                  }}>
                  ● {connected ? "Đang hoạt động" : "Mất kết nối"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                width: 28,
                height: 28,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              ✕
            </button>
          </div>

          {/* Body: sidebar + chat */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Sidebar user list */}
            <div
              style={{
                width: 220,
                borderRight: "1px solid #e2e8f0",
                overflowY: "auto",
                background: "#f8fafc",
              }}>
              {users.length === 0 ? (
                <div
                  style={{
                    padding: 16,
                    fontSize: 12,
                    color: "#94a3b8",
                    textAlign: "center",
                  }}>
                  Chưa có hội thoại
                </div>
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => selectUser(u)}
                    style={{
                      padding: "10px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background:
                        selectedUser?.id === u.id ? "#eff6ff" : "transparent",
                      borderLeft:
                        selectedUser?.id === u.id
                          ? "3px solid #ff6b35"
                          : "3px solid transparent",
                      transition: "background 0.15s",
                      position: "relative",
                    }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: newUserMap[u.id] ? "#ff6b35" : "#1a1a2e",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}>
                      {(u.fullName || "U")[0].toUpperCase()}
                    </div>

                    {/* Tên + email */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#1e293b",
                        }}>
                        {u.fullName || `User #${u.id}`}
                      </div>
                      {u.email && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                          {u.email}
                        </div>
                      )}
                    </div>

                    {/* Badge unread */}
                    {unreadMap[u.id] > 0 && (
                      <div
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                          flexShrink: 0,
                        }}>
                        {unreadMap[u.id] > 9 ? "9+" : unreadMap[u.id]}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Khu vực chat */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
              {!selectedUser ? (
                <div
                  style={{
                    margin: "auto",
                    color: "#94a3b8",
                    fontSize: 13,
                    textAlign: "center",
                    padding: 20,
                  }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👈</div>
                  Chọn khách hàng để bắt đầu trả lời
                </div>
              ) : (
                <>
                  {/* Tên người đang chat */}
                  <div
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1e293b",
                      background: "#fff",
                      flexShrink: 0,
                    }}>
                    {selectedUser.fullName || `User #${selectedUser.id}`}
                    {selectedUser.email && (
                      <span
                        style={{
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginLeft: 6,
                        }}>
                        · {selectedUser.email}
                      </span>
                    )}
                  </div>

                  {/* Messages */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}>
                    {loading ? (
                      <div
                        style={{
                          margin: "auto",
                          color: "#94a3b8",
                          fontSize: 13,
                        }}>
                        Đang tải...
                      </div>
                    ) : messages.length === 0 ? (
                      <div
                        style={{
                          margin: "auto",
                          color: "#94a3b8",
                          fontSize: 13,
                        }}>
                        Chưa có tin nhắn
                      </div>
                    ) : (
                      messages.map((msg, i) => (
                        <div
                          key={msg.id || i}
                          style={{
                            display: "flex",
                            justifyContent: msg.isMine
                              ? "flex-end"
                              : "flex-start",
                          }}>
                          <div>
                            <div
                              style={{
                                padding: "8px 12px",
                                fontSize: 13,
                                lineHeight: 1.5,
                                borderRadius: msg.isMine
                                  ? "14px 14px 4px 14px"
                                  : "14px 14px 14px 4px",
                                background: msg.isMine ? "#ff6b35" : "#f1f5f9",
                                color: msg.isMine ? "#fff" : "#1e293b",
                                maxWidth: 280,
                              }}>
                              {msg.text}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#94a3b8",
                                marginTop: 2,
                                textAlign: msg.isMine ? "right" : "left",
                              }}>
                              {formatTime(msg.time)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-end",
                      background: "#fff",
                      flexShrink: 0,
                    }}>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={!connected}
                      placeholder={
                        connected ? "Nhập tin nhắn..." : "Đang kết nối..."
                      }
                      rows={1}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        resize: "none",
                        fontSize: 13,
                        outline: "none",
                        minHeight: 38,
                        maxHeight: 100,
                        fontFamily: "inherit",
                      }}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height =
                          Math.min(e.target.scrollHeight, 100) + "px";
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!connected || !input.trim()}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "none",
                        background:
                          connected && input.trim() ? "#ff6b35" : "#e2e8f0",
                        color: connected && input.trim() ? "#fff" : "#94a3b8",
                        cursor:
                          connected && input.trim() ? "pointer" : "not-allowed",
                        fontSize: 13,
                        fontWeight: 500,
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}>
                      Gửi
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#ff6b35",
          border: "none",
          boxShadow: "0 4px 16px rgba(255,107,53,0.45)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
        {/* Badge tổng unread */}
        {!open && totalUnread > 0 && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#ef4444",
              color: "#fff",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 6px",
              border: "2px solid #fff",
            }}>
            {totalUnread > 9 ? "9+" : totalUnread}
          </div>
        )}

        <svg viewBox="0 0 24 24" fill="white" width={22} height={22}>
          {open ? (
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          ) : (
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          )}
        </svg>
      </button>
    </>
  );
}
