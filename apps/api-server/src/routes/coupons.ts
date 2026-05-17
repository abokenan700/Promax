import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const COUPONS: Record<string, { discountPct: number; description: string }> = {
  NAKHBA10: { discountPct: 10, description: "خصم ١٠٪ على جميع المنتجات" },
  NAKHBA20: { discountPct: 20, description: "خصم ٢٠٪ على جميع المنتجات" },
  WELCOME5: { discountPct:  5, description: "خصم ٥٪ للمستخدمين الجدد" },
};

/* ── POST /api/v1/coupons/validate ─────────────────────── */
router.post("/coupons/validate", (req: Request, res: Response) => {
  const { code } = req.body as { code?: string };
  if (!code?.trim()) {
    res.status(400).json({ error: "كود الكوبون مطلوب" });
    return;
  }

  const upper = code.trim().toUpperCase();
  const coupon = COUPONS[upper];

  if (!coupon) {
    res.status(404).json({ error: "كوبون غير صالح أو منتهي الصلاحية" });
    return;
  }

  res.json({ code: upper, discountPct: coupon.discountPct, description: coupon.description });
});

export default router;
