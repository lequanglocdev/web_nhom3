/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductByIdApi } from "../../services/productService";
import { mapProduct } from "../../lib/mapProduct";
import { addToCart } from "../../services/cartService";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    const res = await getProductByIdApi(id);
    setProduct(mapProduct(res.data));
  };

  const handleAdd = async () => {
    await addToCart({
      productId: product.id,
      quantity: 1,
    });
    alert("Đã thêm vào giỏ");
  };

  if (!product) return null;

  return (
    <div className="container mt-5">
      {/* giữ nguyên UI */}

      <h1>{product.name}</h1>
      <img src={product.image} width="300" />

      <p>{product.desc}</p>

      <button onClick={handleAdd} className="btn btn-success">
        Thêm vào giỏ hàng
      </button>
    </div>
  );
}
