import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  removeItem,
  updateCart,
  clearCart,
  applyPromo,
  refreshCartEvent
} from "../../services/cartService";
import api from "../../lib/axios";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
const [promos, setPromos] = useState([]); // danh sách mã hợp lệ hôm nay
const [promoLoading, setPromoLoading] = useState(false);
const [selectedPromo, setSelectedPromo] = useState(""); // code đang chọn
const [promoMsg, setPromoMsg] = useState(null);
const [loadingPromos, setLoadingPromos] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    load();
  }, []);

  useEffect(() => {
    const fetchPromos = async () => {
      setLoadingPromos(true);
      try {
       const { data } = await api.get("/promotions/active");

        // ✅ Dùng Date object thay vì so sánh string
        const today = new Date();
        today.setHours(0, 0, 0, 0); // reset về 00:00:00 của hôm nay

        const valid = data.filter((p) => {
          if (!p.isActive) return false;

          const start = new Date(p.startDate + "T00:00:00"); // tránh lệch timezone
          const end = new Date(p.endDate + "T23:59:59"); // hết ngày endDate

          return today >= start && today <= end;
        });

        console.log("All promos:", data); // debug xem có data không
        console.log("Valid promos:", valid); // debug xem filter ra sao

        setPromos(valid);
      } catch (err) {
        console.error("Fetch promo error:", err);
        setPromos([]);
      } finally {
        setLoadingPromos(false);
      }
    };
    fetchPromos();
  }, []);
  const load = async () => {
    try {
      const res = await getCart();
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleRemove = async (id) => {
    try {
      await removeItem(id);
      showToast("🗑️ Đã xoá sản phẩm");
      refreshCartEvent();
      load();
    } catch (err) {
      showToast("❌ Xoá thất bại", "error",err);
    }
  };

 const handleUpdateQty = async (itemId, newQty) => {
   // bỏ productId, không cần
   if (newQty < 1) return;
   setUpdatingId(itemId);
   try {
     await updateCart({ itemId, quantity: newQty }); // ✅ đúng field
     load();
   } catch (err) {
     showToast("❌ Cập nhật thất bại", "error",err);
   } finally {
     setUpdatingId(null);
   }
 };

  const handleClear = async () => {
    if (!window.confirm("Xoá toàn bộ giỏ hàng?")) return;
    await clearCart();
    showToast("🗑️ Đã xoá giỏ hàng");
    refreshCartEvent()
    load();
  };

const handleApplyPromo = async () => {
  if (!selectedPromo) return;
  setPromoLoading(true);
  setPromoMsg(null);
  try {
    const res = await applyPromo(selectedPromo);
    if (res.data?.status) {
      setPromoMsg({ type: "success", text: "✅ Áp mã thành công!" });
      load();
    } else {
      setPromoMsg({
        type: "error",
        text: res.data?.message || "Mã không hợp lệ",
      });
    }
  } catch (err) {
    setPromoMsg({ type: "error", text: err.message || "❌ Áp mã thất bại" });
  } finally {
    setPromoLoading(false);
  }
};

  if (loading)
    return (
      <div className="pc-container pc-section">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="pc-skeleton"
              style={{ height: 120, borderRadius: "var(--r-lg)" }}
            />
          ))}
        </div>
      </div>
    );

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (s, i) => s + Number(i.product.price) * i.quantity,
    0
  );
  const discount = cart?.discountAmount || 0;
  const total = cart?.finalAmount || subtotal - discount;

  return (
    <div className="pc-container pc-section">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 32,
        }}>
        <div>
          <span className="pc-section-label">Mua sắm</span>
          <h1 className="pc-heading-lg">
            Giỏ hàng
            {items.length > 0 && (
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-3)",
                }}>
                ({items.length} sản phẩm)
              </span>
            )}
          </h1>
        </div>
        {items.length > 0 && (
          <button className="btn-danger" onClick={handleClear}>
            🗑️ Xoá tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="pc-empty" style={{ padding: "100px 24px" }}>
          <div className="pc-empty__icon">🛒</div>
          <div className="pc-empty__title">Giỏ hàng trống</div>
          <div className="pc-empty__desc">
            Thêm sản phẩm vào giỏ để tiếp tục mua sắm
          </div>
          <Link to="/products" className="btn-primary">
            Khám phá sản phẩm →
          </Link>
        </div>
      ) : (
        <div className="pc-cart-layout">
          {/* Items */}
          <div className="pc-cart-list">
            {items.map((item) => (
              <div key={item.id} className="pc-cart-item">
                {/* Image */}
                <Link to={`/products/${item.product.id}`}>
                  <img
                    className="pc-cart-item__img"
                    src={
                      item.product.images?.[0]?.imageUrl ||
                      "https://placehold.co/88x88/0d1b2e/4a90e8?text=PC"
                    }
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/88x88/0d1b2e/4a90e8?text=PC";
                    }}
                  />
                </Link>

                {/* Info */}
                <div className="pc-cart-item__info">
                  {item.product.category?.name && (
                    <div className="pc-cart-item__category">
                      {item.product.category.name}
                    </div>
                  )}
                  <Link to={`/products/${item.product.id}`}>
                    <div className="pc-cart-item__name">
                      {item.product.name}
                    </div>
                  </Link>
                  <div className="pc-cart-item__price">
                    {Number(item.product.price).toLocaleString("vi-VN")}đ
                    {item.quantity > 1 && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-3)",
                          marginLeft: 8,
                        }}>
                        / 1 sp
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="pc-cart-item__controls">
                  {/* Qty */}
                  <div
                    className="pc-qty-control"
                    style={{ transform: "scale(0.9)" }}>
                    <button
                      className="pc-qty-btn"
                      onClick={() =>
                        handleUpdateQty(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1 || updatingId === item.id}>
                      −
                    </button>
                    <div className="pc-qty-value">{item.quantity}</div>
                    <button
                      className="pc-qty-btn"
                      onClick={() =>
                        handleUpdateQty(item.id, item.quantity + 1)
                      }
                      disabled={updatingId === item.id}>
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--cyan)",
                      minWidth: 110,
                      textAlign: "right",
                    }}>
                    {(
                      Number(item.product.price) * item.quantity
                    ).toLocaleString("vi-VN")}
                    đ
                  </div>

                  {/* Remove */}
                  <button
                    className="btn-icon"
                    onClick={() => handleRemove(item.id)}
                    title="Xoá"
                    style={{
                      color: "var(--red)",
                      borderColor: "rgba(248,113,113,0.2)",
                    }}>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pc-cart-summary">
            <div className="pc-cart-summary__title">Tổng đơn hàng</div>

            {/* Promo code */}
            {/* Promo code */}
            <div style={{ marginBottom: 20 }}>
              <div className="form-label">Mã giảm giá</div>

              {loadingPromos ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-3)",
                    padding: "8px 0",
                  }}>
                  Đang tải mã khuyến mãi...
                </div>
              ) : promos.length === 0 ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-3)",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                  }}>
                  🎟️ Không có mã khuyến mãi nào hôm nay
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Dropdown select */}
                  <select
                    value={selectedPromo}
                    onChange={(e) => {
                      setSelectedPromo(e.target.value);
                      setPromoMsg(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface)",
                      color: "var(--text-1)",
                      fontSize: 14,
                      cursor: "pointer",
                      outline: "none",
                    }}>
                    <option value="">-- Chọn mã khuyến mãi --</option>
                    {promos.map((p) => (
                      <option key={p.id} value={p.code}>
                        {p.code} —{" "}
                        {p.discountType === "PERCENT"
                          ? `Giảm ${p.discountValue}%`
                          : `Giảm ${Number(p.discountValue).toLocaleString(
                              "vi-VN"
                            )}đ`}
                        {p.minOrderValue > 0
                          ? ` (Đơn tối thiểu ${Number(
                              p.minOrderValue
                            ).toLocaleString("vi-VN")}đ)`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {/* Chi tiết mã đang chọn */}
                  {selectedPromo &&
                    (() => {
                      const p = promos.find((x) => x.code === selectedPromo);
                      return p ? (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: "rgba(16,185,129,0.08)",
                            border: "1px solid rgba(16,185,129,0.25)",
                            fontSize: 13,
                          }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#10b981",
                              marginBottom: 4,
                            }}>
                            🎟️ {p.name}
                          </div>
                          <div style={{ color: "var(--text-2)" }}>
                            {p.discountType === "PERCENT"
                              ? `Giảm ${p.discountValue}% tổng đơn`
                              : `Giảm ${Number(p.discountValue).toLocaleString(
                                  "vi-VN"
                                )}đ`}
                          </div>
                          <div
                            style={{
                              color: "var(--text-3)",
                              fontSize: 12,
                              marginTop: 4,
                            }}>
                            HSD:{" "}
                            {new Date(
                              p.endDate + "T00:00:00"
                            ).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      ) : null;
                    })()}

                  {/* Nút áp mã */}
                  <button
                    className="btn-primary"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !selectedPromo}
                    style={{ width: "100%", padding: "10px" }}>
                    {promoLoading ? "Đang áp mã..." : "Áp dụng mã"}
                  </button>
                </div>
              )}

              {/* Thông báo kết quả */}
              {promoMsg && (
                <div
                  style={{
                    fontSize: 13,
                    marginTop: 8,
                    color:
                      promoMsg.type === "success"
                        ? "var(--green)"
                        : "var(--red)",
                  }}>
                  {promoMsg.text}
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Rows */}
            <div className="pc-cart-summary__row">
              <span>Tạm tính ({items.length} sp)</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="pc-cart-summary__row">
              <span>Phí vận chuyển</span>
              <span style={{ color: "var(--green)" }}>Miễn phí</span>
            </div>
            {discount > 0 && (
              <div className="pc-cart-summary__row pc-cart-summary__discount">
                <span>Giảm giá</span>
                <span>−{Number(discount).toLocaleString("vi-VN")}đ</span>
              </div>
            )}

            <div className="divider" />

            <div className="pc-cart-summary__row pc-cart-summary__row--total">
              <span>Tổng cộng</span>
              <div className="pc-cart-summary__total-val">
                {Number(total).toLocaleString("vi-VN")}đ
              </div>
            </div>

            <button
              className="btn-primary"
              style={{
                width: "100%",
                marginTop: 20,
                padding: "15px",
                fontSize: 15,
              }}
              onClick={() => navigate("/checkout")}>
              Tiến hành thanh toán →
            </button>

            <Link
              to="/products"
              className="btn-ghost"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 10,
                color: "var(--text-2)",
              }}>
              ← Tiếp tục mua sắm
            </Link>

            {/* Trust badges */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 20,
                flexWrap: "wrap",
              }}>
              {["🔒 Thanh toán an toàn", "🛡️ Bảo hành đầy đủ"].map((b, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    color: "var(--text-3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`pc-toast pc-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
