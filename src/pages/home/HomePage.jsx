/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/common/ProductCard";
import { getProductsApi,  } from "../../services/productService"
import { getCategoriesApi } from "../../services/categoryService";
import { mapProduct } from "../../lib/mapProduct";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const pRes = await getProductsApi();
    const cRes = await getCategoriesApi();

    setProducts(pRes.data.map(mapProduct));
    setCategories(cRes.data);
  };

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="container py-4">
      {/* HERO giữ nguyên */}

      <section className="mt-5">
        <h2 className="section-title">Danh mục nổi bật</h2>

        <div className="row g-4">
          {categories.map((c) => (
            <div className="col-lg-3 col-md-6" key={c.id}>
              <div className="category-box">
                <h4>{c.name}</h4>
                <p className="text-muted mb-0">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <h2 className="section-title mb-0">Sản phẩm nổi bật</h2>
          <Link to="/products" className="btn btn-outline-primary">
            Xem tất cả
          </Link>
        </div>

        <div className="row g-4">
          {featuredProducts.map((product) => (
            <div className="col-lg-3 col-md-4 col-sm-6" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
