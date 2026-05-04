import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { dashboardAPI } from "../../services/dashboardService";
import ExportButton from "../../components/common/Exportbutton";
import { exportReportPDF, exportReportExcel } from "../../lib/Exportutils";
// ── Màu sắc ──────────────────────────────────────────────────────────────
const COLORS = ["#ff6b35", "#4361ee", "#06d6a0", "#ffd166", "#ef476f", "#118ab2"];

const formatVND = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val ?? 0);

const formatShort = (val) => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + " tỷ";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + " tr";
  if (val >= 1_000) return (val / 1_000).toFixed(0) + "k";
  return val;
};

// ── Helper: ngày mặc định ────────────────────────────────────────────────
const toInputDate = (d) => d.toISOString().split("T")[0];

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: toInputDate(from), to: toInputDate(to) };
};

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: "24px 28px",
      display: "flex",
      alignItems: "center",
      gap: 20,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: color + "1a",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <i className={`bi ${icon}`} style={{ fontSize: 22, color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#8892a4", fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "#8892a4", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────
function Card({ title, icon, children, style }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      overflow: "hidden",
      ...style,
    }}>
      <div style={{
        padding: "18px 24px",
        borderBottom: "1px solid #f0f2f5",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <i className={`bi ${icon}`} style={{ color: "#ff6b35", fontSize: 18 }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>{title}</span>
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

// ── Custom tooltip cho BarChart ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1a1a2e", color: "#fff", borderRadius: 10,
      padding: "10px 16px", fontSize: 13,
    }}>
      <div style={{ marginBottom: 4, opacity: 0.7 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#ff6b35", fontWeight: 600 }}>
          {formatVND(p.value)}
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [range, setRange] = useState(defaultRange);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const load = useCallback(async () => {
    if (!range.from || !range.to || range.from > range.to) return;
    setLoading(true);
    setError("");
    try {
      const from = new Date(range.from);
      const to   = new Date(range.to);

      const [sumRes, catRes, topRes] = await Promise.all([
        dashboardAPI.getSummary(from, to),
        dashboardAPI.getCategories(from, to),
        dashboardAPI.getTopProducts(from, to, 7),
      ]);

      setSummary(sumRes.data);
      setCategories(catRes.data);
      setTopProducts(topRes.data);
    } catch (e) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.",e);
    } finally {
      setLoading(false);
    }
  }, [range]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);
const handleExportPDF = () => {
  exportReportPDF({ summary, categories, topProducts, range });
};

const handleExportExcel = () => {
  exportReportExcel({ summary, categories, topProducts, range });
};
  // ── Render ──
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#1a1a2e" }}>
            Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", color: "#8892a4", fontSize: 14 }}>
            Thống kê doanh thu & kinh doanh
          </p>
        </div>

        {/* Date range picker */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#fff", borderRadius: 12, padding: "10px 16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        }}>
          <i className="bi bi-calendar3" style={{ color: "#ff6b35" }} />
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
            style={{ border: "none", outline: "none", fontSize: 14, color: "#1a1a2e", background: "transparent" }}
          />
          <span style={{ color: "#8892a4" }}>→</span>
          <input
            type="date"
            value={range.to}
            min={range.from}
            max={toInputDate(new Date())}
            onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
            style={{ border: "none", outline: "none", fontSize: 14, color: "#1a1a2e", background: "transparent" }}
          />
          <button onClick={load} disabled={loading}
            style={{
              background: "#ff6b35", color: "#fff", border: "none",
              borderRadius: 8, padding: "6px 14px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>
            {loading
              ? <><span className="spinner-border spinner-border-sm" /> Đang tải</>
              : <><i className="bi bi-arrow-clockwise" /> Lọc</>}
          </button>
          <ExportButton
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            loading={loading}
            label="Xuất báo cáo"
          />
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff0f0", border: "1px solid #ffc9c9", borderRadius: 10, padding: "12px 18px", marginBottom: 24, color: "#e03131", fontSize: 14 }}>
          <i className="bi bi-exclamation-triangle me-2" />{error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard
          icon="bi-cash-stack"
          label="Tổng doanh thu"
          value={summary ? formatShort(summary.totalRevenue) : "—"}
          sub={summary ? formatVND(summary.totalRevenue) : ""}
          color="#ff6b35"
        />
        <StatCard
          icon="bi-bag-check"
          label="Tổng đơn hàng"
          value={summary ? summary.totalOrders.toLocaleString("vi-VN") : "—"}
          sub="đơn thành công"
          color="#4361ee"
        />
        <StatCard
          icon="bi-receipt"
          label="Giá trị trung bình"
          value={summary ? formatShort(summary.avgOrderValue) : "—"}
          sub="mỗi đơn hàng"
          color="#06d6a0"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

        {/* Doanh thu theo danh mục - Bar chart */}
        <Card title="Doanh thu theo danh mục" icon="bi-bar-chart-fill">
          {categories.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
                <XAxis
                  dataKey="categoryName"
                  tick={{ fontSize: 12, fill: "#8892a4" }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: "#8892a4" }} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie chart danh mục */}
        <Card title="Tỉ trọng doanh thu" icon="bi-pie-chart-fill">
          {categories.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="revenue"
                  nameKey="categoryName"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ fontSize: 12, color: "#1a1a2e" }}>{value}</span>}
                />
                <Tooltip formatter={(val) => formatVND(val)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Top sản phẩm */}
      <Card title="Top sản phẩm bán chạy" icon="bi-trophy-fill">
        {topProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f2f5" }}>
                  {["#", "Sản phẩm", "Số lượng bán", "Doanh thu", "% doanh thu"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: h === "Sản phẩm" ? "left" : "right",
                      fontSize: 12, color: "#8892a4", fontWeight: 600, textTransform: "uppercase",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => {
                  const totalRev = topProducts.reduce((s, x) => s + Number(x.revenue), 0);
                  const pct = totalRev > 0 ? ((Number(p.revenue) / totalRev) * 100).toFixed(1) : 0;
                  return (
                    <tr key={p.productId} style={{ borderBottom: "1px solid #f7f8fa" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: i < 3 ? COLORS[i] : "#f0f2f5",
                          color: i < 3 ? "#fff" : "#8892a4",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 13,
                        }}>{i + 1}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>
                        {p.productName}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right", color: "#4361ee", fontWeight: 600 }}>
                        {p.quantitySold.toLocaleString("vi-VN")}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right", color: "#1a1a2e", fontWeight: 600 }}>
                        {formatVND(p.revenue)}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                          <div style={{ width: 80, height: 6, borderRadius: 3, background: "#f0f2f5", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#8892a4", minWidth: 36 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#8892a4" }}>
      <i className="bi bi-inbox" style={{ fontSize: 36, display: "block", marginBottom: 10 }} />
      Không có dữ liệu trong khoảng thời gian này
    </div>
  );
}
