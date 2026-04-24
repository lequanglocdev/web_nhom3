export default function AdminDashboardPage() {
  const cardStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "20px",
    transition: "0.3s",
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#333333",
  };

  const subtitleStyle = {
    color: "var(--text-2)",
    marginTop: "4px",
  };

  const numberStyle = {
    fontSize: "22px",
    fontWeight: "700",
    color: "var(--text-1)",
  };

  const labelStyle = {
    color: "var(--text-2)",
    fontSize: "14px",
    marginTop: "4px",
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={titleStyle}>Admin Dashboard</h1>
        <p style={subtitleStyle}>
          Tổng quan hệ thống quản trị cửa hàng WebShop.
        </p>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}>
        {[
          { value: 128, label: "Tổng sản phẩm" },
          { value: 34, label: "Danh mục" },
          { value: 56, label: "Đơn hàng mới" },
          { value: 245, label: "Người dùng" },
        ].map((item, index) => (
          <div key={index} style={cardStyle}>
            <h3 style={numberStyle}>{item.value}</h3>
            <p style={labelStyle}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* ACTIVITY */}
      <div style={{ ...cardStyle, marginTop: "24px" }}>
        <h4 style={{ color: "var(--text-1)", marginBottom: "8px" }}>
          Tình hình hoạt động
        </h4>
        <p style={{ color: "var(--text-2)", fontSize: "14px" }}>
          Trang dashboard hiển thị số liệu nhanh để quản trị viên theo dõi tình
          trạng cửa hàng.
        </p>
      </div>
    </div>
  );
}
