import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="card-body">
        <span className="badge-category">{product.category}</span>
        <h5 className="card-title">{product.name}</h5>
        <p className="product-desc">{product.desc}</p>
        <div className="product-price">
          {product.price.toLocaleString("vi-VN")} đ
        </div>

        <Link to={`/products/${product.id}`} className="btn btn-product">
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}