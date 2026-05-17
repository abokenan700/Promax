import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const mockCategories = [
  { slug: "new",      name: "جديدنا",   image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80&fm=webp" },
  { slug: "clothes",  name: "ملابس",    image_url: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=300&q=80&fm=webp" },
  { slug: "shoes",    name: "أحذية",    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80&fm=webp" },
  { slug: "perfumes", name: "عطور",     image_url: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80&fm=webp" },
  { slug: "jewelry",  name: "مجوهرات",  image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80&fm=webp" },
  { slug: "offers",   name: "عروض",     image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80&fm=webp" },
];

router.get("/categories", (_req: Request, res: Response) => {
  res.json(mockCategories);
});

export default router;
