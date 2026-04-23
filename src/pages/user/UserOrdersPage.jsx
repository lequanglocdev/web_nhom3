import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  myOrders,
  orderDetail,
  cancelOrder,
  confirmDelivered,
} from "../../services/orderService";
const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: "⏳",
  },
  UNPAID: {
    label: "Chờ thanh toán",
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: "💳",
  },
  PAID: { label: "Đã thanh toán", color: "#10b981", bg: "#d1fae5", icon: "✅" },
  SHIPPING: {
    label: "Đang vận chuyển",
    color: "#8b5cf6",
    bg: "#ede9fe",
    icon: "🚚",
  }, // ✅
  DELIVERED: {
    label: "Đã giao hàng",
    color: "#059669",
    bg: "#d1fae5",
    icon: "📦",
  }, // ✅
  CANCELLED: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2", icon: "❌" },
};

const ALL_STATUSES = [
  "ALL",
  "PENDING",
  "UNPAID",
  "PAID",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

const fmt    = (n) => Number(n || 0).toLocaleString("vi-VN");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function UserOrdersPage() {
  const location = useLocation();
  const successMsg = location.state?.successMsg;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null); // order detail
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchParams] = useSearchParams();
  // Thêm state
  const [confirmCancel, setConfirmCancel] = useState(null); // orderId

  // Sửa handleCancel — bỏ window.confirm
  const handleCancel = async (orderId) => {
    try {
      setCancelling(orderId);
      await cancelOrder(orderId);
      showToast("Hủy đơn hàng thành công!");
      setSelected(null);
      setConfirmCancel(null);
      fetchOrders();
    } catch (err) {
      showToast(err.message || "Hủy đơn thất bại", "error");
    } finally {
      setCancelling(null);
    }
  };

  const [confirming, setConfirming] = useState(null);

  const handleConfirmDelivered = async (orderId) => {
    try {
      setConfirming(orderId);
      await confirmDelivered(orderId);
      showToast("✅ Xác nhận nhận hàng thành công!");
      setSelected(null);
      fetchOrders();
    } catch (err) {
      showToast(err.message || "Thất bại", "error");
    } finally {
      setConfirming(null);
    }
  };

  // ── Toast ──────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch orders ───────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await myOrders();
      const data = Array.isArray(res.data) ? res.data : [];
      // Sắp xếp mới nhất lên đầu
      setOrders(
        data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      );
    } catch (err) {
      showToast("Lỗi tải đơn hàng: " + (err.message || ""), "error");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  fetchOrders();

  // ✅ Thêm đoạn này
  const paymentStatus = searchParams.get("payment");
  if (paymentStatus === "success") {
    showToast("✅ Thanh toán VNPay thành công!");
  } else if (paymentStatus === "failed") {
    const code = searchParams.get("code");
    showToast(`❌ Thanh toán thất bại (mã: ${code})`, "error");
  }

  if (successMsg) showToast(successMsg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // ── View detail ────────────────────────────────────────────
  const handleViewDetail = async (order) => {
    setLoadingDetail(true);
    setSelected(order); // show modal ngay với data cơ bản
    try {
      const res = await orderDetail(order.id);
      setSelected(res.data);
    } catch {
      // fallback dùng data đã có
    } finally {
      setLoadingDetail(false);
    }
  };

 

  // ── Filter ─────────────────────────────────────────────────
  const filtered =
    filterStatus === "ALL"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  // ══════════════════════════════════════════════════════════
  return (
    <div className="pc-container pc-section">
      {/* Toast */}
      {toast && (
        <div className={`pc-toast pc-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <span className="pc-section-label">Tài khoản</span>
        <h1 className="pc-heading-lg">Đơn hàng của tôi</h1>
        <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 4 }}>
          Tổng {orders.length} đơn hàng
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count =
            s === "ALL"
              ? orders.length
              : orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                transition: "all .2s",
                background:
                  filterStatus === s
                    ? cfg
                      ? cfg.color
                      : "var(--primary)"
                    : "var(--bg-surface)",
                color: filterStatus === s ? "#fff" : "var(--text-2)",
                // eslint-disable-next-line no-dupe-keys
                border: `1.5px solid ${
                  filterStatus === s
                    ? cfg?.color || "var(--primary)"
                    : "var(--border)"
                }`,
              }}>
              {s === "ALL"
                ? `Tất cả (${count})`
                : `${cfg?.icon} ${cfg?.label} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="pc-skeleton"
              style={{ height: 120, borderRadius: 16 }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="pc-empty" style={{ padding: "80px 24px" }}>
          <div className="pc-empty__icon">📦</div>
          <div className="pc-empty__title">Chưa có đơn hàng nào</div>
          <div className="pc-empty__desc">Hãy mua sắm và quay lại đây nhé!</div>
          <Link to="/products" className="btn-primary">
            Khám phá sản phẩm →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || {};
            const canCancel =
              order.status === "PENDING" || order.status === "UNPAID";
            return (
              <div
                key={order.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: 16,
                  padding: 20,
                  transition: "box-shadow .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = "var(--shadow-lg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "none")
                }>
                {/* Order header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 14,
                    flexWrap: "wrap",
                    gap: 8,
                  }}>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "var(--text-1)",
                      }}>
                      Đơn hàng #{order.id}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-3)",
                        marginTop: 3,
                      }}>
                      {fmtDate(order.orderDate)} · {order.paymentMethod}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                      color: cfg.color,
                      background: cfg.bg,
                    }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>

                {/* Products preview */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 14,
                    flexWrap: "wrap",
                  }}>
                  {(order.items || []).slice(0, 4).map((item, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={
                          item.product?.images?.[0]?.imageUrl ||
                          "https://placehold.co/52x52/0d1b2e/4a90e8?text=SP"
                        }
                        alt={item.product?.name}
                        style={{
                          width: 52,
                          height: 52,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/52x52/0d1b2e/4a90e8?text=SP";
                        }}
                      />
                      {item.quantity > 1 && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            background: "var(--primary)",
                            color: "#fff",
                            borderRadius: "50%",
                            width: 18,
                            height: 18,
                            fontSize: 10,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          ×{item.quantity}
                        </div>
                      )}
                    </div>
                  ))}
                  {(order.items || []).length > 4 && (
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 8,
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "var(--text-3)",
                        fontWeight: 600,
                      }}>
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}>
                  <div>
                    {order.promoCode && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--green)",
                          marginRight: 12,
                        }}>
                        🎟️ {order.promoCode}
                      </span>
                    )}
                    <span style={{ fontSize: 14, color: "var(--text-3)" }}>
                      {(order.items || []).length} sản phẩm ·
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "var(--cyan)",
                        marginLeft: 6,
                      }}>
                      {fmt(order.finalAmount)}đ
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {canCancel && (
                      <button
                        onClick={() => setConfirmCancel(order.id)}
                        disabled={cancelling === order.id}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          border: "1.5px solid var(--red)",
                          background: "transparent",
                          color: "var(--red)",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                        }}>
                        {cancelling === order.id ? "Đang hủy..." : "Hủy đơn"}
                      </button>
                    )}
                    {/* Nút xác nhận nhận hàng ở card */}
                    {order.status === "SHIPPING" && (
                      <button
                        onClick={() => handleConfirmDelivered(order.id)}
                        disabled={confirming === order.id}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: "#059669",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                        }}>
                        {confirming === order.id
                          ? "Đang xử lý..."
                          : "📦 Đã nhận hàng"}
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetail(order)}
                      className="btn-primary"
                      style={{ padding: "7px 18px", fontSize: 13 }}>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal chi tiết ─────────────────────────────────── */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setSelected(null)}>
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 560,
              maxHeight: "88vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
              border: "1px solid var(--border-mid)",
            }}
            onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text-1)",
                  }}>
                  Đơn hàng #{selected.id}
                </h2>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-3)",
                    marginTop: 3,
                  }}>
                  {fmtDate(selected.orderDate)}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "var(--text-3)",
                }}>
                ✕
              </button>
            </div>

            {/* Status */}
            {(() => {
              const cfg = STATUS_CONFIG[selected.status] || {};
              return (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    marginBottom: 20,
                    background: cfg.bg,
                    color: cfg.color,
                    fontWeight: 600,
                    fontSize: 14,
                  }}>
                  {cfg.icon} {cfg.label}
                </div>
              );
            })()}

            {/* Thông tin giao hàng */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-3)",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}>
                Thông tin giao hàng
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}>
                {[
                  ["Người nhận", selected.customerName],
                  ["Số điện thoại", selected.phone],
                  ["Địa chỉ", selected.shippingAddress],
                  ["Thanh toán", selected.paymentMethod],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: "var(--bg-surface)",
                      borderRadius: 10,
                      padding: "10px 12px",
                    }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-3)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}>
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text-1)",
                        fontWeight: 500,
                      }}>
                      {value || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sản phẩm */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-3)",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}>
                Sản phẩm
              </div>
              {loadingDetail ? (
                <div
                  style={{
                    color: "var(--text-3)",
                    fontSize: 13,
                    textAlign: "center",
                    padding: 20,
                  }}>
                  Đang tải...
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(selected.items || []).map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: "1px solid var(--border)",
                      }}>
                      <img
                        src={
                          item.product?.images?.[0]?.imageUrl ||
                          "https://placehold.co/48x48/0d1b2e/4a90e8?text=SP"
                        }
                        alt={item.product?.name}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/48x48/0d1b2e/4a90e8?text=SP";
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "var(--text-1)",
                          }}>
                          {item.product?.name || "Sản phẩm"}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                          x{item.quantity}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--primary)",
                          fontSize: 14,
                        }}>
                        {fmt(Number(item.price) * item.quantity)}đ
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tổng tiền */}
            <div
              style={{
                background: "var(--bg-surface)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 20,
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}>
                <span style={{ fontSize: 14, color: "var(--text-2)" }}>
                  Tạm tính
                </span>
                <span style={{ fontSize: 14, color: "var(--text-1)" }}>
                  {fmt(selected.totalAmount)}đ
                </span>
              </div>
              {selected.discountAmount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}>
                  <span style={{ fontSize: 14, color: "var(--text-2)" }}>
                    Giảm giá
                    {selected.promoCode ? ` (${selected.promoCode})` : ""}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--red)" }}>
                    −{fmt(selected.discountAmount)}đ
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTop: "1px solid var(--border)",
                }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--text-1)",
                  }}>
                  Tổng cộng
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--cyan)",
                  }}>
                  {fmt(selected.finalAmount)}đ
                </span>
              </div>
            </div>

            {/* Hủy đơn */}
            {(selected.status === "PENDING" ||
              selected.status === "UNPAID") && (
              <button
                onClick={() => setConfirmCancel(selected.id)}
                disabled={cancelling === selected.id}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 10,
                  border: "1.5px solid var(--red)",
                  background: "transparent",
                  color: "var(--red)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                {cancelling === selected.id
                  ? "Đang hủy..."
                  : "🗑️ Hủy đơn hàng này"}
              </button>
            )}
            {/* Nút xác nhận nhận hàng trong modal */}
            {selected.status === "SHIPPING" && (
              <button
                onClick={() => handleConfirmDelivered(selected.id)}
                disabled={confirming === selected.id}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 10,
                  border: "none",
                  background: "#059669",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  marginTop: 10,
                }}>
                {confirming === selected.id
                  ? "Đang xử lý..."
                  : "📦 Tôi đã nhận được hàng"}
              </button>
            )}
          </div>
        </div>
      )}
      {/* ── Confirm hủy đơn ─────────────────────────────────── */}
      {confirmCancel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: 20,
          }}>
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: 16,
              padding: 28,
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              border: "1px solid var(--border-mid)",
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-1)",
              }}>
              Hủy đơn hàng?
            </h3>
            <p
              style={{
                color: "var(--text-3)",
                fontSize: 14,
                marginBottom: 24,
              }}>
              Bạn có chắc muốn hủy đơn hàng <strong>#{confirmCancel}</strong>?
              Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmCancel(null)}
                disabled={cancelling === confirmCancel}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                Giữ lại
              </button>
              <button
                onClick={() => handleCancel(confirmCancel)}
                disabled={cancelling === confirmCancel}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--red)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                {cancelling === confirmCancel ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
