import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import { getProductsApi } from "../../services/productService";
import { mapProduct } from "../../lib/mapProduct";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    load();
  }, []);

  const load = async () => {
    const res = await getProductsApi();
    setProducts(res.data.map(mapProduct));
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (search.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }, [products, search, category, sort]);

  return (
    <div className="container py-4">
      {/* giữ nguyên UI */}

      <div className="row g-4">
        {filteredProducts.map((product) => (
          <div className="col-lg-3 col-md-4 col-sm-6" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
