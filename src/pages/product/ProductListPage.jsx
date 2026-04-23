import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/common/ProductCard";
import { getProductsApi } from "../../services/productService";
import { getCategoriesApi } from "../../services/categoryService";
import { mapProduct } from "../../lib/mapProduct";

const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá: Thấp → Cao" },
  { value: "price-desc", label: "Giá: Cao → Thấp" },
  { value: "name-asc", label: "Tên: A → Z" },
];

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ? Number(searchParams.get("category")) : null
  );
  const [sort, setSort] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    load();
  }, []);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        getProductsApi(),
        getCategoriesApi(),
      ]);
      setProducts(pRes.data.map(mapProduct));
      setCategories(cRes.data.filter((c) => c.isActive !== false));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim())
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );

    if (selectedCategory)
      list = list.filter(
        (p) =>
          p.categoryId === selectedCategory ||
          p.category === categories.find((c) => c.id === selectedCategory)?.name
      );

    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [
    products,
    search,
    selectedCategory,
    sort,
    minPrice,
    maxPrice,
    categories,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search.trim()) params.set("q", search);
    else params.delete("q");
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setMinPrice("");
    setMaxPrice("");
    setSort("default");
    setSearchParams({});
  };

  const hasFilters =
    search || selectedCategory || minPrice || maxPrice || sort !== "default";

  return (
    <div className="pc-container pc-section">
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <span className="pc-section-label">Cửa hàng</span>
        <h1 className="pc-heading-lg">Tất cả sản phẩm</h1>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="pc-search-bar">
        <div className="pc-search-bar__input-wrap">
          <span className="pc-search-bar__icon">🔍</span>
          <input
            className="form-input pc-search-bar__input"
            style={{ paddingLeft: 42 }}
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">
          Tìm kiếm
        </button>
        {hasFilters && (
          <button
            type="button"
            className="btn-secondary"
            onClick={clearFilters}>
            Xoá lọc
          </button>
        )}
      </form>

      {/* Layout */}
      <div className="pc-list-layout">
        {/* Sidebar */}
        <aside className="pc-sidebar">
          <div className="pc-sidebar__title">Bộ lọc</div>

          {/* Category */}
          <div className="pc-filter-section">
            <div className="pc-filter-title">📁 Danh mục</div>
            <div
              className={`pc-category-filter-item ${
                !selectedCategory ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(null)}>
              <span>Tất cả</span>
              <span className="pc-category-filter-count">
                {products.length}
              </span>
            </div>
            {categories.map((c) => {
              const count = products.filter(
                (p) => p.category === c.name || p.categoryId === c.id
              ).length;
              return (
                <div
                  key={c.id}
                  className={`pc-category-filter-item ${
                    selectedCategory === c.id ? "active" : ""
                  }`}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === c.id ? null : c.id)
                  }>
                  <span>{c.name}</span>
                  <span className="pc-category-filter-count">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="divider" />

          {/* Price */}
          <div className="pc-filter-section">
            <div className="pc-filter-title">💰 Khoảng giá</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                className="form-input"
                type="number"
                placeholder="Giá từ (đ)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ fontSize: 13 }}
              />
              <input
                className="form-input"
                type="number"
                placeholder="Giá đến (đ)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ fontSize: 13 }}
              />
            </div>
          </div>

          <div className="divider" />

          {/* Quick price filters */}
          <div className="pc-filter-section">
            <div className="pc-filter-title">⚡ Giá nhanh</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Dưới 5 triệu", max: 5_000_000 },
                { label: "5 - 15 triệu", min: 5_000_000, max: 15_000_000 },
                { label: "15 - 30 triệu", min: 15_000_000, max: 30_000_000 },
                { label: "Trên 30 triệu", min: 30_000_000 },
              ].map((range, i) => (
                <button
                  key={i}
                  className="btn-ghost"
                  style={{
                    justifyContent: "flex-start",
                    fontSize: 13,
                    background:
                      minPrice == (range.min || "") &&
                      maxPrice == (range.max || "")
                        ? "var(--primary-glow)"
                        : "transparent",
                    color:
                      minPrice == (range.min || "") &&
                      maxPrice == (range.max || "")
                        ? "var(--primary-light)"
                        : "var(--text-2)",
                  }}
                  onClick={() => {
                    setMinPrice(range.min || "");
                    setMaxPrice(range.max || "");
                  }}>
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product area */}
        <div>
          {/* Header */}
          <div className="pc-list-header">
            <div className="pc-list-header__count">
              Hiển thị <span>{filtered.length}</span> / {products.length} sản
              phẩm
              {hasFilters && (
                <span style={{ marginLeft: 8 }}>
                  {[
                    selectedCategory &&
                      categories.find((c) => c.id === selectedCategory)?.name,
                    search && `"${search}"`,
                  ]
                    .filter(Boolean)
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="badge badge-blue"
                        style={{ marginLeft: 6 }}>
                        {tag}
                      </span>
                    ))}
                </span>
              )}
            </div>
            <select
              className="form-input form-select pc-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div
              className="pc-product-grid"
              style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="pc-skeleton"
                  style={{ height: 340, borderRadius: "var(--r-lg)" }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="pc-empty">
              <div className="pc-empty__icon">🔍</div>
              <div className="pc-empty__title">Không tìm thấy sản phẩm</div>
              <div className="pc-empty__desc">
                Thử điều chỉnh bộ lọc hoặc từ khoá tìm kiếm
              </div>
              <button className="btn-primary" onClick={clearFilters}>
                Xoá tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div
              className="pc-product-grid"
              style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    animation: `fadeInUp 0.4s ease ${
                      Math.min(i, 5) * 0.07
                    }s both`,
                  }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
