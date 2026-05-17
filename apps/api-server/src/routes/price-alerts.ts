import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { priceAlertsTable, notificationsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware, type JwtPayload } from "../middlewares/auth";

type AuthReq = Request & { user: JwtPayload };

const router: IRouter = Router();

/* ── GET /api/v1/price-alerts ───────────────────────────────── */
router.get("/price-alerts", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const alerts = await db
      .select()
      .from(priceAlertsTable)
      .where(eq(priceAlertsTable.user_id, userId));
    res.json(alerts);
  } catch (err) { next(err); }
});

/* ── POST /api/v1/price-alerts ──────────────────────────────── */
router.post("/price-alerts", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const { product_id, product_name, product_image, current_price, target_price } =
      req.body as {
        product_id: number; product_name: string; product_image: string;
        current_price: number; target_price: number;
      };

    if (!product_id || !target_price || !current_price) {
      res.status(400).json({ error: "بيانات التنبيه غير مكتملة" });
      return;
    }
    if (target_price >= current_price) {
      res.status(400).json({ error: "السعر المستهدف يجب أن يكون أقل من السعر الحالي" });
      return;
    }

    /* إذا كان هناك تنبيه مسبق للمنتج → حذفه أولاً (تحديث) */
    await db
      .delete(priceAlertsTable)
      .where(and(eq(priceAlertsTable.user_id, userId), eq(priceAlertsTable.product_id, product_id)));

    const [alert] = await db.insert(priceAlertsTable).values({
      user_id: userId,
      product_id,
      product_name,
      product_image,
      current_price: String(current_price),
      target_price:  String(target_price),
    }).returning();

    /* إنشاء إشعار تأكيد */
    await db.insert(notificationsTable).values({
      user_id: userId,
      type:    "price",
      title:   "تم تفعيل تنبيه السعر 🔔",
      body:    `سنُخطرك عندما ينخفض سعر "${product_name}" إلى ${Number(target_price).toLocaleString("ar-SA")} ر.س`,
      action:  null,
    });

    res.status(201).json(alert);
  } catch (err) { next(err); }
});

/* ── DELETE /api/v1/price-alerts/:id ────────────────────────── */
router.delete("/price-alerts/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const id     = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    await db
      .delete(priceAlertsTable)
      .where(and(eq(priceAlertsTable.id, id), eq(priceAlertsTable.user_id, userId)));

    res.status(204).end();
  } catch (err) { next(err); }
});

/* ── DELETE /api/v1/price-alerts/product/:productId ─────────── */
router.delete("/price-alerts/product/:productId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId    = (req as AuthReq).user.userId;
    const productId = Number(req.params.productId);
    if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }

    await db
      .delete(priceAlertsTable)
      .where(and(eq(priceAlertsTable.product_id, productId), eq(priceAlertsTable.user_id, userId)));

    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
