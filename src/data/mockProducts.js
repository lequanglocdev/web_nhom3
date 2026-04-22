import laptopDell from "../assets/images/laptop-dell-inspiron-15.jpg";
import sonVelvet from "../assets/images/son-li-velvet.jpg";
import aoThun from "../assets/images/ao-thun-basic-cotton.jpg";
import sachJava from "../assets/images/sach-java-co-ban-den-nang-cao.jpg";
import macbook from "../assets/images/macbook-air-m2-13.jpg";
import hpPavilion from "../assets/images/laptop-hp-pavilion-14.jpg";
import lenovo from "../assets/images/laptop-lenovo-ideapad-slim-5.jpg";
import asusVivobook from "../assets/images/asus-vivobook-15.jpg";

export const mockProducts = [
  {
    id: 1,
    name: "Laptop Dell Inspiron 15",
    category: "Máy tính",
    price: 15000000,
    oldPrice: 17500000,
    image: laptopDell,
    desc: "Laptop học tập, văn phòng, lập trình cơ bản.",
    description:
      "Laptop Dell Inspiron 15 phù hợp cho học tập, văn phòng và lập trình cơ bản. Thiết kế hiện đại, hiệu năng ổn định, màn hình đẹp và thời lượng pin tốt.",
    specs: [
      "Màn hình: 15.6 inch Full HD",
      "CPU: Intel Core i5",
      "RAM: 8GB",
      "SSD: 512GB",
      "Tình trạng: Còn hàng",
    ],
  },
  {
    id: 2,
    name: "Son lì cao cấp Velvet",
    category: "Mỹ phẩm",
    price: 350000,
    image: sonVelvet,
    desc: "Màu son đẹp, bền màu, tôn da và dễ dùng.",
    description: "Son lì cao cấp với chất son mềm mịn, bền màu và phù hợp nhiều tông da.",
    specs: ["Chất son: Lì mịn", "Dung tích: 3.5g", "Xuất xứ: Hàn Quốc"],
  },
  {
    id: 3,
    name: "Áo thun nam basic cotton",
    category: "Thời trang",
    price: 250000,
    image: aoThun,
    desc: "Thoải mái, trẻ trung, phù hợp mặc hằng ngày.",
    description: "Áo thun cotton basic phù hợp đi học, đi chơi, mặc hằng ngày.",
    specs: ["Chất liệu: Cotton", "Form: Regular", "Màu sắc: Trắng"],
  },
  {
    id: 4,
    name: "Lập trình Java từ cơ bản đến nâng cao",
    category: "Sách",
    price: 180000,
    image: sachJava,
    desc: "Phù hợp cho sinh viên CNTT và người mới học.",
    description: "Sách Java dễ học, phù hợp sinh viên và người tự học lập trình.",
    specs: ["Thể loại: Công nghệ", "Số trang: 420", "Ngôn ngữ: Tiếng Việt"],
  },
  {
    id: 5,
    name: "MacBook Air M2 13 inch",
    category: "Máy tính",
    price: 28500000,
    image: macbook,
    desc: "Mỏng nhẹ, mạnh mẽ, cao cấp.",
    description: "MacBook Air M2 thiết kế mỏng nhẹ, hiệu năng tốt cho học tập và làm việc.",
    specs: ["Màn hình: 13.6 inch", "Chip: Apple M2", "RAM: 8GB", "SSD: 256GB"],
  },
  {
    id: 6,
    name: "Laptop HP Pavilion 14",
    category: "Máy tính",
    price: 19900000,
    image: hpPavilion,
    desc: "Thiết kế đẹp, hiệu năng tốt.",
    description: "Laptop HP Pavilion 14 cho văn phòng và học tập.",
    specs: ["Màn hình: 14 inch", "CPU: Intel Core i5", "RAM: 8GB", "SSD: 512GB"],
  },
  {
    id: 7,
    name: "Lenovo IdeaPad Slim 5",
    category: "Máy tính",
    price: 18200000,
    image: lenovo,
    desc: "Thanh lịch, pin bền, học tập tốt.",
    description: "Lenovo IdeaPad Slim 5 có thiết kế thanh lịch, bền bỉ.",
    specs: ["Màn hình: 15.6 inch", "CPU: Ryzen 5", "RAM: 16GB", "SSD: 512GB"],
  },
  {
    id: 8,
    name: "ASUS Vivobook 15",
    category: "Máy tính",
    price: 17600000,
    image: asusVivobook,
    desc: "Hiện đại, bền, phù hợp sinh viên.",
    description: "ASUS Vivobook 15 phù hợp sinh viên và dân văn phòng.",
    specs: ["Màn hình: 15.6 inch", "CPU: Intel Core i5", "RAM: 8GB", "SSD: 512GB"],
  },
];