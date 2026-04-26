/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import api from "../../lib/axios";

const STATUS_CONFIG = {
  PENDING: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fef3c7" },
  UNPAID: { label: "Chờ thanh toán", color: "#3b82f6", bg: "#dbeafe" },
  PAID: { label: "Đã thanh toán", color: "#10b981", bg: "#d1fae5" },
  SHIPPING: { label: "Đang vận chuyển", color: "#8b5cf6", bg: "#ede9fe" }, // ✅
  DELIVERED: { label: "Đã giao hàng", color: "#059669", bg: "#d1fae5" }, // ✅
  CANCELLED: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
};

const ALL_STATUSES = [
  "PENDING",
  "UNPAID",
  "PAID",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // chi tiết đơn
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/orders");
      setOrders(data);
    } catch (err) {
      showToast("Lỗi tải đơn hàng: " + (err.message || ""), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update status ──────────────────────────────────────────
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      await api.put(`/admin/orders/${orderId}`, null, {
        params: { status: newStatus },
      });
      showToast(`Cập nhật trạng thái thành công`);
      await fetchOrders();
      if (selected?.id === orderId) {
        setSelected((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || "Cập nhật thất bại", "error");
    } finally {
      setUpdating(null);
    }
  };

  // ── Filter & Search ────────────────────────────────────────
  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(o.id).includes(q) ||
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.phone || "").includes(q);
    return matchStatus && matchSearch;
  });

  // ── Stats ──────────────────────────────────────────────────
  const stats = ALL_STATUSES.map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }));

  const fmt = (n) =>
    Number(n || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const fmtDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

  // ══════════════════════════════════════════════════════════
  return (
    <div
      style={{
        padding: "28px 32px",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');`}</style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            background: toast.type === "error" ? "#fee2e2" : "#d1fae5",
            color: toast.type === "error" ? "#dc2626" : "#059669",
            animation: "slideIn .3s ease",
          }}>
          {toast.type === "error" ? "✗ " : "✓ "}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
          }}>
          Quản lý đơn hàng
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Tổng {orders.length} đơn hàng
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 28,
        }}>
        {stats.map(({ status, count }) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div
              key={status}
              onClick={() =>
                setFilter(filterStatus === status ? "ALL" : status)
              }
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "18px 20px",
                cursor: "pointer",
                border: `2px solid ${
                  filterStatus === status ? cfg.color : "#e2e8f0"
                }`,
                transition: "all .2s",
                boxShadow: "0 1px 4px rgba(0,0,0,.06)",
              }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: cfg.color }}>
                {count}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}>
        <input
          placeholder="🔍  Tìm theo mã đơn, tên, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 240,
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #e2e8f0",
            fontSize: 14,
            outline: "none",
            background: "#fff",
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1.5px solid #e2e8f0",
            fontSize: 14,
            background: "#fff",
            cursor: "pointer",
            outline: "none",
          }}>
          <option value="ALL">Tất cả trạng thái</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 1px 6px rgba(0,0,0,.07)",
        }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>Không có đơn
            hàng nào
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "Mã đơn",
                  "Khách hàng",
                  "SĐT",
                  "Tổng tiền",
                  "Thanh toán",
                  "Trạng thái",
                  "Ngày đặt",
                  "Hành động",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                      borderBottom: "1px solid #f1f5f9",
                    }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const cfg = STATUS_CONFIG[order.status] || {};
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                      transition: "background .15s",
                    }}>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontWeight: 700,
                        color: "#1e293b",
                      }}>
                      #{order.id}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 14,
                        color: "#334155",
                      }}>
                      {order.customerName || "—"}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#64748b",
                      }}>
                      {order.phone || "—"}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: 14,
                      }}>
                      {fmt(order.finalAmount)}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#64748b",
                      }}>
                      {order.paymentMethod || "—"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          color: cfg.color,
                          background: cfg.bg,
                        }}>
                        {cfg.label || order.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#64748b",
                      }}>
                      {fmtDate(order.orderDate)}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          onClick={() => setSelected(order)}
                          style={btnStyle("#3b82f6")}>
                          Chi tiết
                        </button>

                        {/* COD: PENDING → cho phép vận chuyển hoặc hủy */}
                        {order.status === "PENDING" && (
                          <>
                            <button
                              disabled={updating === order.id}
                              onClick={() =>
                                handleUpdateStatus(order.id, "SHIPPING")
                              }
                              style={btnStyle("#8b5cf6")}>
                              🚚 Vận chuyển
                            </button>
                            <button
                              disabled={updating === order.id}
                              onClick={() =>
                                handleUpdateStatus(order.id, "CANCELLED")
                              }
                              style={btnStyle("#ef4444")}>
                              ✗ Hủy
                            </button>
                          </>
                        )}

                        {/* VNPay: UNPAID → chờ thanh toán, chỉ được hủy */}
                        {order.status === "UNPAID" && (
                          <button
                            disabled={updating === order.id}
                            onClick={() =>
                              handleUpdateStatus(order.id, "CANCELLED")
                            }
                            style={btnStyle("#ef4444")}>
                            ✗ Hủy
                          </button>
                        )}

                        {/* Đã thanh toán VNPay → cho vận chuyển */}
                        {order.status === "PAID" && (
                          <button
                            disabled={updating === order.id}
                            onClick={() =>
                              handleUpdateStatus(order.id, "SHIPPING")
                            }
                            style={btnStyle("#8b5cf6")}>
                            🚚 Vận chuyển
                          </button>
                        )}

                        {/* Đang vận chuyển → xác nhận đã giao */}
                        {order.status === "SHIPPING" && (
                          <button
                            disabled={updating === order.id}
                            onClick={() =>
                              handleUpdateStatus(order.id, "DELIVERED")
                            }
                            style={btnStyle("#059669")}>
                            ✅ Đã giao
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal chi tiết ───────────────────────────────────── */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setSelected(null)}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 600,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 32,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                Chi tiết đơn hàng #{selected.id}
              </h2>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "#64748b",
                }}>
                ✕
              </button>
            </div>

            {/* Thông tin */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 24,
              }}>
              {[
                ["Khách hàng", selected.customerName],
                ["SĐT", selected.phone],
                ["Địa chỉ", selected.shippingAddress],
                ["Ngày đặt", fmtDate(selected.orderDate)],
                ["Thanh toán", selected.paymentMethod],
                ["Mã KM", selected.promoCode || "Không có"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fafc",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}>
                    {label}
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#1e293b", fontWeight: 500 }}>
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Sản phẩm */}
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: "#374151",
                }}>
                Sản phẩm
              </h3>
              {(selected.items || []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {item.product?.name || "Sản phẩm"}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      x{item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {fmt(item.price)}
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: "16px 18px",
              }}>
              <Row label="Tổng tiền gốc" value={fmt(selected.totalAmount)} />
              <Row
                label="Giảm giá"
                value={`- ${fmt(selected.discountAmount)}`}
                color="#ef4444"
              />
              <Row
                label="Thanh toán"
                value={fmt(selected.finalAmount)}
                bold
                color="#10b981"
              />
            </div>

            {/* Cập nhật trạng thái */}
            {/* ✅ MỚI - chỉ ẩn khi CANCELLED hoặc DELIVERED */}
            {selected.status !== "CANCELLED" &&
              selected.status !== "DELIVERED" && (
                <div style={{ marginTop: 20 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 8,
                      display: "block",
                    }}>
                    Cập nhật trạng thái
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {/* PAID → chỉ cho chuyển SHIPPING */}
                    {selected.status === "PAID" ? (
                      <button
                        disabled={updating === selected.id}
                        onClick={() =>
                          handleUpdateStatus(selected.id, "SHIPPING")
                        }
                        style={{
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "none",
                          background: STATUS_CONFIG["SHIPPING"].bg,
                          color: STATUS_CONFIG["SHIPPING"].color,
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                        }}>
                        🚚 Chuyển sang vận chuyển
                      </button>
                    ) : (
                      ALL_STATUSES.filter((s) => s !== selected.status).map(
                        (s) => (
                          <button
                            key={s}
                            disabled={updating === selected.id}
                            onClick={() => handleUpdateStatus(selected.id, s)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: 8,
                              border: "none",
                              background: STATUS_CONFIG[s].bg,
                              color: STATUS_CONFIG[s].color,
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                            }}>
                            {STATUS_CONFIG[s].label}
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        tr:hover td { background: #f0f9ff !important; }
      `}</style>
    </div>
  );
}

function Row({ label, value, bold, color }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
      }}>
      <span style={{ fontSize: 14, color: "#64748b" }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: bold ? 700 : 500,
          color: color || "#0f172a",
        }}>
        {value}
      </span>
    </div>
  );
}

function btnStyle(color) {
  return {
    padding: "5px 12px",
    borderRadius: 8,
    border: "none",
    background: color + "18",
    color,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  };
}
