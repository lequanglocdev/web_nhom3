import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-elevated)",
        borderTop: "1px solid var(--border)",
        marginTop: 60,
        paddingTop: 40,
      }}>
      <div className="pc-container">
        {/* Top */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 32,
            marginBottom: 32,
          }}>
          {/* Brand */}
          <div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 12,
              }}>
              🛍️ WebShop
            </h3>
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>
              Nền tảng mua sắm đa danh mục với hàng ngàn sản phẩm chất lượng.
              Giá tốt mỗi ngày, giao hàng nhanh toàn quốc.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 12 }}>Về chúng tôi</h4>
            <div className="footer-links">
              <Link to="#">Giới thiệu</Link>
              <Link to="#">Tuyển dụng</Link>
              <Link to="#">Điều khoản</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 12 }}>Hỗ trợ</h4>
            <div className="footer-links">
              <Link to="#">Trung tâm trợ giúp</Link>
              <Link to="#">Chính sách đổi trả</Link>
              <Link to="#">Liên hệ</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 12 }}>Liên hệ</h4>
            <div
              style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.8 }}>
              <div>📍 TP.HCM, Việt Nam</div>
              <div>📞 0123 456 789</div>
              <div>✉️ support@webshop.vn</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
            paddingBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>
            © 2026 WebShop. All rights reserved.
          </span>

          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ cursor: "pointer" }}>🌐 Facebook</span>
            <span style={{ cursor: "pointer" }}>📸 Instagram</span>
            <span style={{ cursor: "pointer" }}>🎵 TikTok</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
