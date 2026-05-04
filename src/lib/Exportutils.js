import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ── Helpers ───────────────────────────────────────────────────────────────
const formatVND = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val ?? 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const today = () => new Date().toLocaleDateString("vi-VN");

// ── Màu brand ─────────────────────────────────────────────────────────────
const BRAND = [26, 26, 46];       // #1a1a2e  (dark navy)
const ACCENT = [255, 107, 53];    // #ff6b35  (orange)
const LIGHT = [245, 246, 250];    // #f5f6fa

// ============================================================
// 1. HÓA ĐƠN ĐƠN HÀNG — PDF
// ============================================================
/**
 * @param {Object} order  - object đơn hàng từ API
 * order shape:
 *   id, orderDate, status, paymentMethod, finalAmount,
 *   user: { fullName, email, phone },
 *   shippingAddress,
 *   items: [{ productName, quantity, price }]
 */
export function exportOrderPDF(order) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("HOA DON DAT HANG", 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("WebShop - He thong ban hang truc tuyen", 14, 23);
  doc.text(`Ngay xuat: ${today()}`, 14, 29);

  // Mã đơn (góc phải)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ACCENT);
  doc.text(`#${order.id}`, 196, 22, { align: "right" });

  // ── Thông tin đơn hàng ────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  let y = 46;

  // Box trái: thông tin khách
  doc.setFillColor(...LIGHT);
  doc.roundedRect(14, y, 85, 42, 3, 3, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND);
  doc.text("KHACH HANG", 20, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Ten: ${order.user?.fullName || "—"}`, 20, y + 16);
  doc.text(`Email: ${order.user?.email || "—"}`, 20, y + 22);
  doc.text(`SDT: ${order.user?.phone || "—"}`, 20, y + 28);
  const addr = order.shippingAddress || "—";
  const addrLines = doc.splitTextToSize(`Dia chi: ${addr}`, 75);
  doc.text(addrLines, 20, y + 34);

  // Box phải: thông tin đơn
  doc.setFillColor(...LIGHT);
  doc.roundedRect(111, y, 85, 42, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND);
  doc.text("THONG TIN DON HANG", 117, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Ma don: #${order.id}`, 117, y + 16);
  doc.text(`Ngay dat: ${formatDate(order.orderDate)}`, 117, y + 22);
  doc.text(`Trang thai: ${order.status || "—"}`, 117, y + 28);
  doc.text(`Thanh toan: ${order.paymentMethod || "—"}`, 117, y + 34);

  // ── Bảng sản phẩm ─────────────────────────────────────────
  y += 50;

  autoTable(doc, {
    startY: y,
    head: [["#", "San pham", "So luong", "Don gia", "Thanh tien"]],
    body: (order.items || []).map((item, i) => [
      i + 1,
      item.productName,
      item.quantity,
      formatVND(item.price),
      formatVND(item.price * item.quantity),
    ]),
    headStyles: {
      fillColor: BRAND,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "right", cellWidth: 36 },
      4: { halign: "right", cellWidth: 36 },
    },
    margin: { left: 14, right: 14 },
    styles: { overflow: "linebreak" },
  });

  // ── Tổng tiền ─────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 6;

  doc.setFillColor(...ACCENT);
  doc.roundedRect(120, finalY, 76, 12, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TONG THANH TOAN:", 124, finalY + 7);
  doc.text(formatVND(order.finalAmount), 194, finalY + 7, { align: "right" });

  // ── Footer ────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  doc.text("Cam on quy khach da mua hang tai WebShop!", 105, 285, { align: "center" });
  doc.text("Moi thac mac xin lien he: support@webshop.vn", 105, 289, { align: "center" });

  doc.save(`HoaDon_${order.id}_${Date.now()}.pdf`);
}

// ============================================================
// 2. HÓA ĐƠN ĐƠN HÀNG — EXCEL
// ============================================================
export function exportOrderExcel(order) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Thông tin đơn
  const infoRows = [
    ["HOA DON DAT HANG - WebShop"],
    [],
    ["Ma don hang", `#${order.id}`],
    ["Ngay dat", formatDate(order.orderDate)],
    ["Trang thai", order.status],
    ["Phuong thuc thanh toan", order.paymentMethod],
    [],
    ["KHACH HANG"],
    ["Ho ten", order.user?.fullName],
    ["Email", order.user?.email],
    ["So dien thoai", order.user?.phone],
    ["Dia chi giao hang", order.shippingAddress],
    [],
    ["CHI TIET SAN PHAM"],
    ["STT", "Ten san pham", "So luong", "Don gia (VND)", "Thanh tien (VND)"],
    ...(order.items || []).map((item, i) => [
      i + 1,
      item.productName,
      item.quantity,
      Number(item.price),
      Number(item.price) * item.quantity,
    ]),
    [],
    ["", "", "", "TONG CONG", Number(order.finalAmount)],
  ];

  const ws = XLSX.utils.aoa_to_sheet(infoRows);

  // Độ rộng cột
  ws["!cols"] = [{ wch: 8 }, { wch: 40 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(wb, ws, "Hoa Don");
  XLSX.writeFile(wb, `HoaDon_${order.id}_${Date.now()}.xlsx`);
}

// ============================================================
// 3. BÁO CÁO THỐNG KÊ — PDF
// ============================================================
/**
 * @param {Object} data  - { summary, categories, topProducts, range: {from, to} }
 */
export function exportReportPDF({ summary, categories, topProducts, range }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BAO CAO DOANH THU", 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Tu ngay: ${range.from}  den ngay: ${range.to}`, 14, 23);
  doc.text(`Xuat bao cao: ${today()}`, 14, 29);

  // ── Tổng quan ─────────────────────────────────────────────
  let y = 44;
  doc.setTextColor(...BRAND);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TONG QUAN", 14, y);

  y += 4;
  const statCols = [
    ["Tong doanh thu", formatVND(summary?.totalRevenue)],
    ["Tong don hang", String(summary?.totalOrders ?? 0)],
    ["Gia tri trung binh/don", formatVND(summary?.avgOrderValue)],
  ];

  statCols.forEach(([label, val], i) => {
    const x = 14 + i * 62;
    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, y + 2, 58, 18, 3, 3, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(label, x + 4, y + 9);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ACCENT);
    doc.text(val, x + 4, y + 17);
  });

  // ── Bảng doanh thu theo danh mục ─────────────────────────
  y += 28;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND);
  doc.text("DOANH THU THEO DANH MUC", 14, y);

  autoTable(doc, {
    startY: y + 4,
    head: [["Danh muc", "Doanh thu", "So luong ban"]],
    body: (categories || []).map((c) => [
      c.categoryName,
      formatVND(c.revenue),
      c.quantitySold?.toLocaleString("vi-VN"),
    ]),
    headStyles: { fillColor: BRAND, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Bảng top sản phẩm ─────────────────────────────────────
  const y2 = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND);
  doc.text("TOP SAN PHAM BAN CHAY", 14, y2);

  autoTable(doc, {
    startY: y2 + 4,
    head: [["#", "San pham", "So luong ban", "Doanh thu"]],
    body: (topProducts || []).map((p, i) => [
      i + 1,
      p.productName,
      p.quantitySold?.toLocaleString("vi-VN"),
      formatVND(p.revenue),
    ]),
    headStyles: { fillColor: ACCENT, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  doc.text(`Bao cao tu dong - WebShop Admin | ${today()}`, 105, 290, { align: "center" });

  doc.save(`BaoCaoDoanhThu_${range.from}_${range.to}.pdf`);
}

// ============================================================
// 4. BÁO CÁO THỐNG KÊ — EXCEL
// ============================================================
export function exportReportExcel({ summary, categories, topProducts, range }) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Tổng quan ────────────────────────────────────
  const summaryRows = [
    ["BAO CAO DOANH THU - WebShop"],
    [`Tu ngay: ${range.from}  den ngay: ${range.to}`],
    [`Ngay xuat: ${today()}`],
    [],
    ["TONG QUAN"],
    ["Tong doanh thu (VND)", Number(summary?.totalRevenue ?? 0)],
    ["Tong don hang", Number(summary?.totalOrders ?? 0)],
    ["Gia tri TB/don (VND)", Number(summary?.avgOrderValue ?? 0)],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Tong Quan");

  // ── Sheet 2: Danh mục ─────────────────────────────────────
  const catRows = [
    ["Danh muc", "Doanh thu (VND)", "So luong ban"],
    ...(categories || []).map((c) => [
      c.categoryName,
      Number(c.revenue),
      Number(c.quantitySold),
    ]),
  ];
  const wsCat = XLSX.utils.aoa_to_sheet(catRows);
  wsCat["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsCat, "Doanh Thu Danh Muc");

  // ── Sheet 3: Top sản phẩm ─────────────────────────────────
  const topRows = [
    ["#", "Ten san pham", "So luong ban", "Doanh thu (VND)"],
    ...(topProducts || []).map((p, i) => [
      i + 1,
      p.productName,
      Number(p.quantitySold),
      Number(p.revenue),
    ]),
  ];
  const wsTop = XLSX.utils.aoa_to_sheet(topRows);
  wsTop["!cols"] = [{ wch: 5 }, { wch: 40 }, { wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsTop, "Top San Pham");

  XLSX.writeFile(wb, `BaoCaoDoanhThu_${range.from}_${range.to}.xlsx`);
}
