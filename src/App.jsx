import { useEffect } from "react";
import AppRouter from "./router/AppRouter";

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("vnpay_status");
    const orderId = params.get("orderId");

    if (status === "success") {
      alert(`🎉 Đặt hàng và thanh toán VNPay thành công! (Mã đơn: #${orderId})`);
      // Clean up URL
      window.history.replaceState(null, "", window.location.pathname);
    } else if (status === "failed") {
      alert(`❌ Thanh toán VNPay thất bại hoặc đã bị hủy! (Mã đơn: #${orderId})`);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return <AppRouter />;
}
