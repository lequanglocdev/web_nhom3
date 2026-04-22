export default function AdminDashboardPage() {
  return (
    <div className="p-4">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">
        Tổng quan hệ thống quản trị cửa hàng WebShop.
      </p>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="admin-stat-card">
            <h3>128</h3>
            <p className="mb-0">Tổng sản phẩm</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-stat-card">
            <h3>34</h3>
            <p className="mb-0">Danh mục</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-stat-card">
            <h3>56</h3>
            <p className="mb-0">Đơn hàng mới</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-stat-card">
            <h3>245</h3>
            <p className="mb-0">Người dùng</p>
          </div>
        </div>
      </div>

      <div className="admin-table-wrap mt-4">
        <h4 className="mb-3">Tình hình hoạt động</h4>
        <p className="mb-0 text-muted">
          Trang dashboard hiển thị số liệu nhanh để quản trị viên theo dõi tình
          trạng cửa hàng.
        </p>
      </div>
    </div>
  );
}
