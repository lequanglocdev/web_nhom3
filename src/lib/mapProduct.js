export const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  desc: p.description,
  price: Number(p.price),
  image: p.images?.[0]?.imageUrl || "/no-image.png",
  category: p.category?.name || "Không xác định",
});
