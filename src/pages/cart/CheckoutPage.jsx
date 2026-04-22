import { useState } from "react";
import { checkoutApi } from "../../services/orderService";

export default function CheckoutPage() {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    shippingAddress: "",
    paymentMethod: "COD",
  });

  const handleSubmit = async () => {
    const res = await checkoutApi(form);

    if (res.data.paymentUrl) {
      window.location.href = res.data.paymentUrl;
    } else {
      alert("Đặt hàng thành công");
    }
  };

  return (
    <div className="container py-5">
      {/* giữ nguyên UI */}

      <button onClick={handleSubmit} className="btn btn-product w-100 mt-4">
        Xác nhận đặt hàng
      </button>
    </div>
  );
}
