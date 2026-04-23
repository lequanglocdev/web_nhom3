import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getProductByIdApi } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import { mapProduct } from "../../lib/mapProduct";
import { selectIsAuthenticated } from "../../store/authSlice";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProductByIdApi(id);
      setProduct(mapProduct(res.data));
      setActiveImg(0);
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

  const handleAddToCart = async () => {
    if (!isAuth) {
      navigate("/login");
      return;
    }
    if (product.stock <= 0) return;
    setAdding(true);
    try {
      await addToCart({ productId: product.id, quantity: qty });
      showToast(`✅ Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
    } catch (err) {
      showToast("❌ Thêm vào giỏ thất bại", "error",err);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading)
    return (
      <div className="pc-container pc-section">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div
            className="pc-skeleton"
            style={{ aspectRatio: 1, borderRadius: "var(--r-xl)" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[80, 40, 60, 100, 120, 48].map((h, i) => (
              <div
                key={i}
                className="pc-skeleton"
                style={{ height: h, borderRadius: "var(--r)" }}
              />
            ))}
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="pc-container pc-section">
        <div className="pc-empty">
          <div className="pc-empty__icon">😞</div>
          <div className="pc-empty__title">Không tìm thấy sản phẩm</div>
          <Link to="/products" className="btn-primary">
            ← Quay lại
          </Link>
        </div>
      </div>
    );

  const images = product.images?.length
    ? product.images.map((img) => img.imageUrl || img)
    : [
        product.image ||
          "https://placehold.co/600x600/0d1b2e/4a90e8?text=Product",
      ];

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="pc-container pc-section">
      {/* Breadcrumb */}
      <div className="pc-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/products">Sản phẩm</Link>
        <span>/</span>
        <span style={{ color: "var(--text-2)" }}>{product.name}</span>
      </div>

      {/* Detail layout */}
      <div className="pc-detail-layout">
        {/* Gallery */}
        <div className="pc-gallery">
          <div className="pc-gallery__main">
            <img
              src={images[activeImg]}
              alt={product.name}
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/600x600/0d1b2e/4a90e8?text=Product";
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="pc-gallery__thumbs">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`pc-gallery__thumb ${
                    activeImg === i ? "active" : ""
                  }`}
                  onClick={() => setActiveImg(i)}>
                  <img
                    src={img}
                    alt=""
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/80x80/0d1b2e/4a90e8?text=×";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pc-detail-info">
          <div className="pc-detail-meta">
            <span className="badge badge-blue">{product.category}</span>
            {isOutOfStock ? (
              <span className="badge badge-red">Hết hàng</span>
            ) : (
              <span className="badge badge-green">Còn hàng</span>
            )}
          </div>

          <h1 className="pc-detail-title">{product.name}</h1>

          <div className="pc-detail-price">
            {Number(product.price).toLocaleString("vi-VN")}
            <span>đ</span>
          </div>

          {/* Stock info */}
          <div
            className={`pc-detail-stock ${isOutOfStock ? "out" : ""}`}
            style={{ marginBottom: 20 }}>
            {isOutOfStock ? "Tạm hết hàng" : `Còn ${product.stock} sản phẩm`}
          </div>

          {/* Description */}
          <div className="pc-detail-desc">
            {product.desc ||
              "Sản phẩm chất lượng cao, chính hãng, bảo hành đầy đủ theo tiêu chuẩn nhà sản xuất."}
          </div>

          {/* Guarantees */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 28,
            }}>
            {[
              { icon: "🛡️", text: "Bảo hành chính hãng" },
              { icon: "🚚", text: "Miễn phí vận chuyển" },
              { icon: "↩️", text: "Đổi trả trong 7 ngày" },
            ].map((g, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 13px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  fontSize: 12,
                  color: "var(--text-2)",
                }}>
                <span>{g.icon}</span> {g.text}
              </div>
            ))}
          </div>

         
          {/* Quantity */}
          {!isOutOfStock && (
            <>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  color: "var(--text-2)",
                  fontWeight: 500,
                }}>
                Số lượng
              </div>
              <div className="pc-qty-control">
                <button
                  className="pc-qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1} // ✅ chỉ disable khi qty = 1
                >
                  −
                </button>
                <div className="pc-qty-value">{qty}</div>{" "}
                {/* ✅ div thay vì input */}
                <button
                  className="pc-qty-btn"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock} // ✅ chỉ disable khi hết stock
                >
                  +
                </button>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="pc-detail-actions">
            <button
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              style={{ flex: 1 }}>
              {adding
                ? "Đang thêm..."
                : isOutOfStock
                ? "Hết hàng"
                : "🛒 Thêm vào giỏ"}
            </button>
            <button
              className="btn-secondary"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              style={{ flex: 1 }}>
              ⚡ Mua ngay
            </button>
          </div>

          {/* Price total */}
          {qty > 1 && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "var(--primary-glow)",
                border: "1px solid var(--border-mid)",
                borderRadius: "var(--r)",
                fontSize: 14,
                display: "flex",
                justifyContent: "space-between",
              }}>
              <span style={{ color: "var(--text-2)" }}>
                Thành tiền ({qty} sp):
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "var(--cyan)",
                }}>
                {(Number(product.price) * qty).toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`pc-toast pc-toast--${toast.type}`}
          style={{ animation: "slideUpIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
