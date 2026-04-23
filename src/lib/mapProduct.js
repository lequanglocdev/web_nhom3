export const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  desc: p.description,
  price: Number(p.price),
  stock: p.stock ?? 0,                          // ✅ thêm stock
  image: p.images?.[0]?.imageUrl || "/no-image.png",
  images: p.images || [],                        // ✅ thêm images array cho gallery
  category: p.category?.name || "Không xác định",
  isActive: p.isActive,
});
