import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/authSlice";
import { getCart } from "../../services/cartService";
import { checkoutApi } from "../../services/orderService";
import { refreshCartEvent } from "../../services/cartService";

const PAYMENT_METHODS = [
  {
    value: "COD",
    icon: "💵",
    label: "Thanh toán khi nhận hàng",
    desc: "Trả tiền mặt khi shipper giao hàng",
  },
  {
    value: "VNPAY",
    icon: "💳",
    label: "Thanh toán VNPay",
    desc: "Thanh toán online qua VNPay",
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPayment] = useState("COD");
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    shippingAddress: "",
  });

  // ── Load cart + prefill user info ──────────────────────────
  useEffect(() => {
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
    load();

    // Prefill từ thông tin user
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        customerName: user.fullName || "",
        phone: user.phone || "",
        shippingAddress: user.address || "",
      });
    }
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Place order ────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!form.customerName.trim()) {
      showToast("Vui lòng nhập họ tên", "error");
      return;
    }
    if (!form.phone.trim()) {
      showToast("Vui lòng nhập số điện thoại", "error");
      return;
    }
    if (!form.shippingAddress.trim()) {
      showToast("Vui lòng nhập địa chỉ giao hàng", "error");
      return;
    }

    try {
      setPlacing(true);
      const res = await checkoutApi({ ...form, paymentMethod });
      const { orderId, message, paymentUrl } = res.data;

      refreshCartEvent(); // reset cart badge navbar

      if (paymentMethod === "VNPAY" && paymentUrl) {
        window.location.href = paymentUrl; // redirect sang VNPay
      } else {
        navigate(`/user/orders/${orderId}`, {
          state: { successMsg: message || "Đặt hàng thành công!" },
        });
      }
    } catch (err) {
      showToast(err.message || "Đặt hàng thất bại", "error");
    } finally {
      setPlacing(false);
    }
  };

  // ── Computed ───────────────────────────────────────────────
  const items = cart?.items || [];
  const subtotal = items.reduce(
    (s, i) => s + Number(i.product.price) * i.quantity,
    0
  );
  const discount = cart?.discountAmount || 0;
  const total = cart?.finalAmount || subtotal - discount;
  const fmt = (n) => Number(n).toLocaleString("vi-VN");

  // ══════════════════════════════════════════════════════════
  if (loading)
    return (
      <div
        className="pc-container pc-section"
        style={{ textAlign: "center", padding: 80 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <p style={{ color: "var(--text-3)" }}>Đang tải thông tin...</p>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="pc-container pc-section">
        <div className="pc-empty" style={{ padding: "80px 24px" }}>
          <div className="pc-empty__icon">🛒</div>
          <div className="pc-empty__title">Giỏ hàng trống</div>
          <div className="pc-empty__desc">
            Thêm sản phẩm vào giỏ trước khi thanh toán
          </div>
          <Link to="/products" className="btn-primary">
            Khám phá sản phẩm →
          </Link>
        </div>
      </div>
    );

  return (
    <div className="pc-container pc-section">
      {/* Breadcrumb */}
      <div className="pc-breadcrumb" style={{ marginBottom: 28 }}>
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/cart">Giỏ hàng</Link>
        <span>/</span>
        <span style={{ color: "var(--text-2)" }}>Thanh toán</span>
      </div>

      <h1 className="pc-heading-lg" style={{ marginBottom: 32 }}>
        Xác nhận đơn hàng
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: 28,
          alignItems: "flex-start",
        }}>
        {/* ── LEFT: Form ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Thông tin giao hàng */}
          <Section title="📦 Thông tin giao hàng">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Họ và tên *">
                <input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Số điện thoại *">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Địa chỉ giao hàng *">
                <textarea
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </FormField>
            </div>
          </Section>

          {/* Phương thức thanh toán */}
          <Section title="💳 Phương thức thanh toán">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PAYMENT_METHODS.map((m) => (
                <div
                  key={m.value}
                  onClick={() => setPayment(m.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: `2px solid ${
                      paymentMethod === m.value
                        ? "var(--primary)"
                        : "var(--border)"
                    }`,
                    background:
                      paymentMethod === m.value
                        ? "var(--primary-glow)"
                        : "var(--bg-surface)",
                    transition: "all .2s",
                  }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: `2px solid ${
                        paymentMethod === m.value
                          ? "var(--primary)"
                          : "var(--border)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    {paymentMethod === m.value && (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "var(--primary)",
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "var(--text-1)",
                      }}>
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-3)",
                        marginTop: 2,
                      }}>
                      {m.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Danh sách sản phẩm */}
          <Section title={`🛒 Sản phẩm (${items.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}>
                  <img
                    src={
                      item.product.images?.[0]?.imageUrl ||
                      "https://placehold.co/60x60/0d1b2e/4a90e8?text=SP"
                    }
                    alt={item.product.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/60x60/0d1b2e/4a90e8?text=SP";
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "var(--text-1)",
                      }}>
                      {item.product.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-3)",
                        marginTop: 2,
                      }}>
                      x{item.quantity}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--primary)",
                    }}>
                    {fmt(Number(item.product.price) * item.quantity)}đ
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── RIGHT: Summary ────────────────────────────────── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-mid)",
            borderRadius: 20,
            padding: 24,
            position: "sticky",
            top: 20,
          }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>
            Tổng đơn hàng
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 16,
            }}>
            <SummaryRow
              label={`Tạm tính (${items.length} sản phẩm)`}
              value={`${fmt(subtotal)}đ`}
            />
            <SummaryRow
              label="Phí vận chuyển"
              value="Miễn phí"
              valueColor="var(--green)"
            />
            {discount > 0 && (
              <SummaryRow
                label={`Giảm giá${
                  cart?.promotionCode ? ` (${cart.promotionCode})` : ""
                }`}
                value={`−${fmt(discount)}đ`}
                valueColor="var(--red)"
              />
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 14,
              marginBottom: 20,
            }}>
            <SummaryRow
              label="Tổng cộng"
              value={`${fmt(total)}đ`}
              bold
              valueColor="var(--cyan)"
              large
            />
          </div>

          {/* Promo code hiện tại */}
          {cart?.promotionCode && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                marginBottom: 16,
                background: "rgba(16,185,129,.1)",
                border: "1px solid rgba(16,185,129,.3)",
                fontSize: 13,
                color: "var(--green)",
                fontWeight: 600,
              }}>
              🎟️ Mã {cart.promotionCode} đã áp dụng
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: 15,
              fontWeight: 700,
            }}>
            {placing
              ? "Đang xử lý..."
              : paymentMethod === "VNPAY"
              ? "Thanh toán qua VNPay →"
              : "Đặt hàng ngay →"}
          </button>

          <Link
            to="/cart"
            className="btn-ghost"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 10,
              color: "var(--text-3)",
            }}>
            ← Quay lại giỏ hàng
          </Link>

          {/* Trust */}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}>
            {[
              "🔒 Thanh toán bảo mật SSL",
              "🛡️ Bảo hành chính hãng",
              "↩️ Đổi trả trong 7 ngày",
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  color: "var(--text-3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`pc-toast pc-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-mid)",
        borderRadius: 16,
        padding: 22,
      }}>
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text-1)",
        }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-2)",
          marginBottom: 6,
          display: "block",
        }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, valueColor, bold, large }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
      <span
        style={{
          fontSize: large ? 15 : 14,
          color: "var(--text-2)",
          fontWeight: bold ? 600 : 400,
        }}>
        {label}
      </span>
      <span
        style={{
          fontSize: large ? 18 : 14,
          fontWeight: bold ? 700 : 500,
          color: valueColor || "var(--text-1)",
        }}>
        {value}
      </span>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg-surface)",
  color: "var(--text-1)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color .2s",
};
