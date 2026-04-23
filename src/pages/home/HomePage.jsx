import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../../components/common/ProductCard";
import { getProductsApi } from "../../services/productService";
import { getCategoriesApi } from "../../services/categoryService";
import { mapProduct } from "../../lib/mapProduct";

const CATEGORY_ICONS = {
  default: "🛍️",
  "Thời trang": "👕",
  "Điện thoại": "📱",
  Laptop: "💻",
  "Điện tử": "📺",
  "Gia dụng": "🏠",
  "Làm đẹp": "💄",
  "Thể thao": "⚽",
  Sách: "📚",
  "Mẹ & bé": "🍼",
  "Phụ kiện": "⌚",
};

function getCategoryIcon(name = "") {
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.default;
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([getProductsApi(), getCategoriesApi()]);
      setProducts(pRes.data.map(mapProduct));
      setCategories(cRes.data.filter(c => c.isActive !== false));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
    else navigate("/products");
  };

  const featuredProducts = products.slice(0, 8);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* ── HERO ───────────────────────────────────────────── */}
      <div className="pc-hero">
        <div className="pc-hero__bg" />

        <div
          className="pc-container"
          style={{ width: "100%", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 48,
              alignItems: "center",
            }}>
            {/* Left */}
            <div className="pc-hero__content">
              <div className="pc-hero__eyebrow">
                🛍️ Nền tảng mua sắm đa danh mục #1 Việt Nam
              </div>

              <h1 className="pc-heading-xl pc-hero__title">
                <span style={{ display: "block", color: "var(--text-1)" }}>
                  Khám phá
                </span>
                <span className="gradient-text" style={{ display: "block" }}>
                  Hàng ngàn sản phẩm
                </span>
                <span style={{ display: "block", color: "var(--text-1)" }}>
                  cho mọi nhu cầu
                </span>
              </h1>

              <p className="pc-hero__subtitle">
                Hàng chính hãng, giá tốt mỗi ngày. Nhiều ưu đãi hấp dẫn & giao
                hàng nhanh toàn quốc.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                style={{ display: "flex", gap: 10, marginBottom: 32 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-3)",
                      fontSize: 16,
                    }}>
                    🔍
                  </span>
                  <input
                    className="form-input"
                    style={{ paddingLeft: 42, height: 52 }}
                    placeholder="Tìm kiếm "
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ height: 52, paddingInline: 28 }}>
                  Tìm kiếm
                </button>
              </form>

              <div className="pc-hero__actions">
                <Link
                  to="/products"
                  className="btn-primary"
                  style={{ fontSize: 15, padding: "14px 32px" }}>
                  Mua sắm ngay →
                </Link>
                <Link to="/products?sort=newest" className="btn-secondary">
                  Sản phẩm mới
                </Link>
              </div>

              <div className="pc-hero__stats">
                <div>
                  <div className="pc-hero__stat-num">
                    5k<span>+</span>
                  </div>
                  <div className="pc-hero__stat-label">Sản phẩm</div>
                </div>
                <div>
                  <div className="pc-hero__stat-num">
                    50k<span>+</span>
                  </div>
                  <div className="pc-hero__stat-label">Khách hàng</div>
                </div>
                <div>
                  <div className="pc-hero__stat-num">
                    24<span>/7</span>
                  </div>
                  <div className="pc-hero__stat-label">Hỗ trợ</div>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
              {/* Decorative rings */}
              <div
                style={{
                  position: "absolute",
                  width: 400,
                  height: 400,
                  border: "1px solid var(--border)",
                  borderRadius: "50%",
                  animation: "spin-slow 30s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  border: "1px dashed var(--border-mid)",
                  borderRadius: "50%",
                }}
              />

              {/* Feature chips floating */}
              {[
                {
                  label: "Chính hãng 100%",
                  icon: "✅",
                  pos: { top: "10%", right: "0" },
                },
                {
                  label: "Bảo hành 3 năm",
                  icon: "🛡️",
                  pos: { bottom: "15%", left: "0" },
                },
                {
                  label: "Free ship HCM",
                  icon: "🚚",
                  pos: { bottom: "30%", right: "-5%" },
                },
              ].map((chip, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    ...chip.pos,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-mid)",
                    borderRadius: "var(--r)",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    boxShadow: "var(--shadow-glow)",
                    animation: `float ${4 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.8}s`,
                    zIndex: 2,
                  }}>
                  <span>{chip.icon}</span>
                  <span style={{ color: "var(--text-1)" }}>{chip.label}</span>
                </div>
              ))}

              {/* Central image placeholder */}
              <div
                style={{
                  width: 260,
                  height: 260,
                  background: "var(--bg-surface)",
                  borderRadius: "var(--r-xl)",
                  border: "1px solid var(--border-mid)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 100,
                  animation: "float 5s ease-in-out infinite",
                  boxShadow: "0 20px 60px var(--primary-glow)",
                  position: "relative",
                  zIndex: 1,
                }}>
                🛍️
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background:
              "linear-gradient(to bottom, transparent, var(--bg-base))",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <div className="pc-section">
        <div className="pc-container">
          <span className="pc-section-label">Khám phá</span>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 28,
            }}>
            <h2 className="pc-heading-lg" style={{ margin: 0 }}>
              Danh mục <span className="gradient-text">nổi bật</span>
            </h2>
            <Link
              to="/products"
              className="btn-ghost"
              style={{ color: "var(--primary-light)" }}>
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="category-grid">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="pc-skeleton"
                  style={{ height: 140, borderRadius: "var(--r-lg)" }}
                />
              ))}
            </div>
          ) : (
            <div className="category-grid">
              {categories.map((c) => (
                <Link
                  to={`/products?category=${c.id}`}
                  key={c.id}
                  className="category-card"
                  style={{ textDecoration: "none" }}>
                  <div className="category-card__icon">
                    {getCategoryIcon(c.name)}
                  </div>
                  <div className="category-card__name">{c.name}</div>
                  <div className="category-card__desc">
                    {c.description || "Xem sản phẩm"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ──────────────────────────────── */}
      <div className="pc-section" style={{ paddingTop: 0 }}>
        <div className="pc-container">
          <span className="pc-section-label">Được yêu thích</span>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 28,
            }}>
            <h2 className="pc-heading-lg" style={{ margin: 0 }}>
              Sản phẩm <span className="gradient-text">nổi bật</span>
            </h2>
            <Link to="/products" className="btn-secondary">
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <div
              className="pc-product-grid"
              style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="pc-skeleton"
                  style={{ height: 340, borderRadius: "var(--r-lg)" }}
                />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="pc-empty">
              <div className="pc-empty__icon">📦</div>
              <div className="pc-empty__title">Chưa có sản phẩm</div>
            </div>
          ) : (
            <div
              className="pc-product-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              }}>
              {featuredProducts.map((p, i) => (
                <div
                  key={p.id}
                  style={{ animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PROMO BANNER ───────────────────────────────────── */}
      <div className="pc-section" style={{ paddingTop: 0 }}>
        <div className="pc-container">
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--bg-elevated) 0%, #1a2f4a 50%, var(--bg-surface) 100%)",
              border: "1px solid var(--border-mid)",
              borderRadius: "var(--r-xl)",
              padding: "48px 48px",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 32,
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}>
            {/* Decorative glow */}
            <div
              style={{
                position: "absolute",
                top: "-50%",
                right: "10%",
                width: 300,
                height: 300,
                background:
                  "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--yellow-bg)",
                  border: "1px solid rgba(251,191,36,0.25)",
                  borderRadius: 100,
                  padding: "4px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--yellow)",
                  marginBottom: 16,
                }}>
                🔥 Ưu đãi đặc biệt
              </div>
              <h3 className="pc-heading-lg" style={{ marginBottom: 12 }}>
                Giảm đến <span className="gradient-text">30%</span> cho đơn hàng đầu tiên
              </h3>
              <p
                style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 480 }}>
                Áp dụng mã giảm giá khi thanh toán. Số lượng có hạn — nhanh tay
                kẻo hết!
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                position: "relative",
                zIndex: 1,
              }}>
              <Link
                to="/products"
                className="btn-primary"
                style={{ fontSize: 15, padding: "15px 36px" }}>
                Mua ngay
              </Link>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--text-3)",
                }}>
                *Điều kiện áp dụng
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHY CHOOSE US ──────────────────────────────────── */}
      <div className="pc-section" style={{ paddingTop: 0 }}>
        <div className="pc-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 20,
            }}>
            {[
              {
                icon: "🏆",
                title: "Hàng chính hãng",
                desc: "Cam kết chất lượng từ nhà bán uy tín",
              },
              {
                icon: "⚡",
                title: "Giao hàng nhanh",
                desc: "Giao hàng toàn quốc, nhanh chóng",
              },
              {
                icon: "💸",
                title: "Giá tốt mỗi ngày",
                desc: "Nhiều ưu đãi và mã giảm giá hấp dẫn",
              },
              {
                icon: "💬",
                title: "Hỗ trợ 24/7",
                desc: "Luôn sẵn sàng hỗ trợ bạn mọi lúc",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-lg)",
                  padding: "28px 24px",
                  textAlign: "center",
                  transition: "var(--transition-slow)",
                  animation: `fadeInUp 0.5s ease ${i * 0.1}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-mid)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>
                  {item.icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-2)",
                    lineHeight: 1.6,
                  }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
