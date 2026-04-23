import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../store/authSlice";
import { addToCart, refreshCartEvent } from "../../services/cartService";

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const isAuth = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) {
      navigate("/login");
      return;
    }
    if (product.stock <= 0) return;
    setAdding(true);
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      refreshCartEvent();
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="pc-card">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="pc-card__image-wrap">
        <img
          src={product.image || "/placeholder-product.png"}
          alt={product.name}
          className="pc-card__img"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/400x300/0d1b2e/4a90e8?text=Product";
          }}
        />

        {isOutOfStock && <div className="pc-card__sold-out">HẾT HÀNG</div>}
      </Link>

      {/* Body */}
      <div className="pc-card__body">
        {/* Category */}
        <div
          style={{
            fontSize: 12,
            color: "var(--text-3)",
            marginBottom: 4,
          }}>
          {product.category || "Danh mục"}
        </div>

        {/* Name */}
        <Link to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
          <h5
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-1)",
              marginBottom: 6,
              lineHeight: 1.4,
              height: "2.8em",
              overflow: "hidden",
            }}>
            {product.name}
          </h5>
        </Link>

        {/* Price */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--primary)",
            marginBottom: 8,
          }}>
          {Number(product.price).toLocaleString("vi-VN")}đ
        </div>

        {/* Description (optional – nhẹ thôi) */}
        <div
          style={{
            fontSize: 12,
            color: "var(--text-3)",
            height: "2.6em",
            overflow: "hidden",
            marginBottom: 10,
          }}>
          {product.desc || "Sản phẩm chất lượng, giá tốt"}
        </div>

        {/* Action */}
        <div style={{ display: "flex", gap: 8 }}>
          {/* Thêm vào giỏ */}
          <button
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              border: "1.5px solid var(--primary)",
              background: "transparent",
              color: isOutOfStock
                ? "var(--text-3)"
                : added
                ? "var(--green)"
                : "var(--primary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              transition: "0.2s",
              borderColor: isOutOfStock
                ? "var(--bg-muted)"
                : added
                ? "var(--green)"
                : "var(--primary)",
            }}>
            {isOutOfStock
              ? "Hết hàng"
              : adding
              ? "..."
              : added
              ? "✓ Đã thêm"
              : "Thêm vào giỏ"}
          </button>

          {/* Mua ngay */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuth) {
                navigate("/login");
                return;
              }
              if (isOutOfStock) return;
              setAdding(true);
              try {
                await addToCart({ productId: product.id, quantity: 1 });
                refreshCartEvent();
                navigate("/cart");
              } catch (err) {
                console.error(err);
              } finally {
                setAdding(false);
              }
            }}
            disabled={adding || isOutOfStock}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: isOutOfStock ? "var(--bg-muted)" : "var(--primary)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              transition: "0.2s",
            }}>
            {adding ? "..." : "Mua ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
