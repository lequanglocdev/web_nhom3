import { useState, useRef, useEffect } from "react";

/**
 * Dropdown button xuất PDF / Excel
 * Props:
 *   onExportPDF   - function
 *   onExportExcel - function
 *   loading       - boolean (disable khi đang tải data)
 *   label         - string (mặc định "Xuất file")
 */
export default function ExportButton({
  onExportPDF,
  onExportExcel,
  loading,
  label = "Xuất file",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handle = (fn) => {
    setOpen(false);
    fn?.();
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: open ? "#e8590c" : "#ff6b35",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "9px 18px",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          transition: "background 0.15s",
          boxShadow: "0 2px 8px rgba(255,107,53,0.3)",
        }}>
        <i className="bi bi-download" style={{ fontSize: 16 }} />
        {label}
        <i
          className={`bi bi-chevron-${open ? "up" : "down"}`}
          style={{ fontSize: 12 }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "#fff",
            borderRadius: 10,
            minWidth: 180,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            border: "1px solid #f0f2f5",
            zIndex: 999,
            overflow: "hidden",
          }}>
          <button
            onClick={() => handle(onExportPDF)}
            style={menuItemStyle("#ff6b35")}>
            <i
              className="bi bi-file-earmark-pdf-fill"
              style={{ color: "#e03131" }}
            />
            Xuất PDF
          </button>
          <div style={{ height: 1, background: "#f0f2f5" }} />
          <button
            onClick={() => handle(onExportExcel)}
            style={menuItemStyle("#1a7f3c")}>
            <i
              className="bi bi-file-earmark-excel-fill"
              style={{ color: "#1a7f3c" }}
            />
            Xuất Excel
          </button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = () => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "11px 16px",
  background: "none",
  border: "none",
  fontSize: 14,
  color: "#1a1a2e",
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.1s",
});
