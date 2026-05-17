import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";

const router: IRouter = Router();

const mockProducts = [
  {
    id: 1,
    name: "عطر شانيل No.5",
    brand: "CHANEL",
    price: 385,
    original_price: 550,
    discount: 30,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400",
    is_new: false,
    rating: 4.9,
    sales: 1420,
    colors: ["#F5F0E8", "#E8D5B7", "#C0A882"],
  },
  {
    id: 2,
    name: "حقيبة ديور سادل",
    brand: "DIOR",
    price: 890,
    original_price: 1200,
    discount: 25,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    is_new: true,
    rating: 4.8,
    sales: 870,
    colors: ["#8B7355", "#2E2C2A", "#C0A882"],
  },
  {
    id: 3,
    name: "نظارة قوتشي شمسية",
    brand: "GUCCI",
    price: 295,
    original_price: 420,
    discount: 30,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    is_new: false,
    rating: 4.7,
    sales: 2100,
    colors: ["#2E2C2A", "#8B7355"],
  },
  {
    id: 4,
    name: "ساعة فيرساتشي",
    brand: "VERSACE",
    price: 1250,
    original_price: 1800,
    discount: 30,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
    is_new: false,
    rating: 4.8,
    sales: 540,
    colors: ["#C0A882", "#2E2C2A"],
  },
  {
    id: 5,
    name: "محفظة لويس فيتون",
    brand: "LV",
    price: 650,
    original_price: 850,
    discount: 23,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    is_new: false,
    rating: 4.9,
    sales: 3200,
    colors: ["#8B7355", "#C0A882"],
  },
  {
    id: 6,
    name: "حذاء قوتشي جلد",
    brand: "GUCCI",
    price: 780,
    original_price: 1050,
    discount: 25,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    is_new: true,
    rating: 4.7,
    sales: 680,
    colors: ["#2E2C2A", "#8B7355", "#F5F0E8"],
  },
  {
    id: 7,
    name: "وشاح باربيري كلاسيك",
    brand: "BURBERRY",
    price: 420,
    original_price: 600,
    discount: 30,
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400",
    is_new: false,
    rating: 4.6,
    sales: 1850,
    colors: ["#C0A882", "#8B7355", "#2E2C2A"],
  },
  {
    id: 8,
    name: "عطر ديور سوفاج",
    brand: "DIOR",
    price: 320,
    original_price: 440,
    discount: 27,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400",
    is_new: true,
    rating: 4.9,
    sales: 4100,
    colors: ["#2E2C2A", "#C0A882"],
  },
  {
    id: 9,
    name: "حقيبة شانيل كلاسيك",
    brand: "CHANEL",
    price: 2100,
    original_price: 2800,
    discount: 25,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
    is_new: false,
    rating: 5.0,
    sales: 290,
    colors: ["#2E2C2A", "#F5F0E8", "#C0A882"],
  },
  {
    id: 10,
    name: "بيلت لويس فيتون",
    brand: "LV",
    price: 380,
    original_price: 520,
    discount: 26,
    image: "https://images.unsplash.com/photo-1624222247344-550fb60fe8ff?w=400",
    is_new: false,
    rating: 4.8,
    sales: 960,
    colors: ["#8B7355", "#2E2C2A"],
  },
  {
    id: 11,
    name: "نظارة فيرساتشي ذهبية",
    brand: "VERSACE",
    price: 340,
    original_price: 480,
    discount: 29,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    is_new: true,
    rating: 4.6,
    sales: 720,
    colors: ["#C0A882", "#2E2C2A"],
  },
  {
    id: 12,
    name: "حذاء ديور هيلز",
    brand: "DIOR",
    price: 960,
    original_price: 1300,
    discount: 26,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
    is_new: true,
    rating: 4.7,
    sales: 430,
    colors: ["#F5F0E8", "#C0A882", "#2E2C2A"],
  },
  {
    id: 13,
    name: "قميص باربيري مربعات",
    brand: "BURBERRY",
    price: 480,
    original_price: 680,
    discount: 29,
    image: "https://images.unsplash.com/photo-1602810319428-019690571b5b?w=400",
    is_new: false,
    rating: 4.5,
    sales: 1120,
    colors: ["#8B7355", "#C0A882"],
  },
  {
    id: 14,
    name: "خاتم قوتشي ذهبي",
    brand: "GUCCI",
    price: 185,
    original_price: 260,
    discount: 28,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
    is_new: false,
    rating: 4.6,
    sales: 2400,
    colors: ["#C0A882", "#F5F0E8"],
  },
  {
    id: 15,
    name: "عطر شانيل Coco Mademoiselle",
    brand: "CHANEL",
    price: 410,
    original_price: 570,
    discount: 28,
    image: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400",
    is_new: false,
    rating: 4.9,
    sales: 3800,
    colors: ["#F5F0E8", "#C0A882"],
  },
  {
    id: 16,
    name: "ساعة لويس فيتون تانبور",
    brand: "LV",
    price: 1850,
    original_price: 2500,
    discount: 26,
    image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=400",
    is_new: true,
    rating: 4.9,
    sales: 190,
    colors: ["#C0A882", "#2E2C2A"],
  },
];

function normalizeArabic(term: string): string {
  return term
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[أإآا]/g, "ا")
    .replace(/^ال/, "")
    .trim();
}

router.get("/products/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const product = mockProducts.find((p) => p.id === id);
  if (!product) { res.status(404).json({ error: "Not found" }); return; }
  res.json(product);
});

router.get("/products", (req: Request, res: Response) => {
  const { q, brand, minPrice, maxPrice, page, limit: limitQ } = req.query as Record<string, string | undefined>;

  const pageNum  = Math.max(1, Number(page  ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(limitQ ?? 20)));

  let filtered = [...mockProducts];

  if (q && q.trim()) {
    const raw        = q.trim().toLowerCase();
    const normalized = normalizeArabic(raw);
    filtered = filtered.filter((p) => {
      const name  = p.name.toLowerCase();
      const br    = p.brand.toLowerCase();
      const normName = normalizeArabic(name);
      return name.includes(raw) || br.includes(raw) || normName.includes(normalized);
    });
  }

  if (brand && brand.trim()) {
    filtered = filtered.filter((p) => p.brand === brand.trim());
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    filtered = filtered.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    filtered = filtered.filter((p) => p.price <= Number(maxPrice));
  }

  const total    = filtered.length;
  const offset   = (pageNum - 1) * pageSize;
  const paginated = filtered.slice(offset, offset + pageSize);

  res.setHeader("X-Total-Count", String(total));
  res.setHeader("X-Page",        String(pageNum));
  res.setHeader("X-Page-Size",   String(pageSize));
  res.setHeader("X-Pages",       String(Math.ceil(total / pageSize)));
  res.json(paginated);
});

export default router;
