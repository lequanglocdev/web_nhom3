/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { getCart, removeItem } from "../../services/cartService";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getCart();
    setCart(res.data);
  };

  const handleRemove = async (id) => {
    await removeItem(id);
    load();
  };

  if (!cart) return null;

  const total = cart.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <div className="container py-5">
      <h1>Giỏ hàng</h1>

      {cart.items.map((item) => (
        <div key={item.id}>
          <img src={item.product.images?.[0]?.imageUrl} width="80" />
          {item.product.name} - {item.quantity}
          <button onClick={() => handleRemove(item.id)}>Xoá</button>
        </div>
      ))}

      <h3>{total.toLocaleString("vi-VN")} đ</h3>

      <button onClick={() => nav("/checkout")}>Thanh toán</button>
    </div>
  );
}
