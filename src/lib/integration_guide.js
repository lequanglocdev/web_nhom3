// // ============================================================
// // CÁCH TÍCH HỢP XUẤT FILE VÀO ADMIN DASHBOARD
// // ============================================================

// // 1. Trong AdminDashboardPage.jsx — thêm vào đầu file:
// import ExportButton from "../../components/ExportButton";
// import { exportReportPDF, exportReportExcel } from "../../utils/exportUtils";

// // 2. Trong component, thêm 2 hàm xử lý:
// const handleExportPDF = () => {
//   exportReportPDF({ summary, categories, topProducts, range });
// };

// const handleExportExcel = () => {
//   exportReportExcel({ summary, categories, topProducts, range });
// };

// // 3. Thêm nút vào header (cạnh nút "Lọc"):
// <ExportButton
//   onExportPDF={handleExportPDF}
//   onExportExcel={handleExportExcel}
//   loading={loading}
//   label="Xuất báo cáo"
// />


// // ============================================================
// // CÁCH TÍCH HỢP XUẤT HÓA ĐƠN VÀO TRANG ĐƠN HÀNG (Admin)
// // ============================================================

// // 1. Trong AdminOrdersPage.jsx — thêm vào đầu file:
// import ExportButton from "../../components/ExportButton";
// import { exportOrderPDF, exportOrderExcel } from "../../utils/exportUtils";

// // 2. Trong row hoặc modal chi tiết đơn hàng, thêm nút:
// <ExportButton
//   onExportPDF={() => exportOrderPDF(order)}
//   onExportExcel={() => exportOrderExcel(order)}
//   label="In hóa đơn"
// />

// // Hoặc nếu muốn 2 nút riêng biệt:
// <button onClick={() => exportOrderPDF(order)}>
//   <i className="bi bi-file-earmark-pdf" /> PDF
// </button>
// <button onClick={() => exportOrderExcel(order)}>
//   <i className="bi bi-file-earmark-excel" /> Excel
// </button>


// // ============================================================
// // CẤU TRÚC ORDER OBJECT CẦN CÓ
// // ============================================================
// // {
// //   id: 123,
// //   orderDate: "2024-01-15T10:30:00",
// //   status: "DELIVERED",
// //   paymentMethod: "VNPAY",
// //   finalAmount: 1500000,
// //   shippingAddress: "123 Nguyen Van A, Q1, TP.HCM",
// //   user: {
// //     fullName: "Nguyen Van B",
// //     email: "abc@gmail.com",
// //     phone: "0901234567"
// //   },
// //   items: [
// //     { productName: "Laptop Dell XPS", quantity: 1, price: 1200000 },
// //     { productName: "Chuột Logitech", quantity: 2, price: 150000 },
// //   ]
// // }
// // Nếu API trả về tên field khác thì sửa lại trong exportUtils.js
