import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, usersTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware, type JwtPayload } from "../middlewares/auth";

type AuthReq = Request & { user: JwtPayload };

const router: IRouter = Router();

/* ── GET /api/v1/orders ─────────────────────────────────── */
router.get("/orders", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;

    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.user_id, userId))
      .orderBy(desc(ordersTable.created_at));

    const withItems = await Promise.all(
      orders.map(async (order: typeof orders[number]) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.order_id, order.id));
        return { ...order, items };
      })
    );

    res.json(withItems);
  } catch (err) { next(err); }
});

/* ── POST /api/v1/orders ────────────────────────────────── */
router.post("/orders", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const {
      items,
      payment_method,
      address_name, address_phone, address_city, address_district, address_street,
      subtotal, shipping, total,
    } = req.body as {
      items: { product_id: number; name: string; brand: string; price: number; qty: number; color: string; image: string }[];
      payment_method: string;
      address_name: string; address_phone: string; address_city: string;
      address_district: string; address_street: string;
      subtotal: number; shipping: number; total: number;
    };

    if (!items || items.length === 0) {
      res.status(400).json({ error: "السلة فارغة" });
      return;
    }
    if (!payment_method) {
      res.status(400).json({ error: "طريقة الدفع مطلوبة" });
      return;
    }

    const [order] = await db.insert(ordersTable).values({
      user_id: userId,
      payment_method,
      address_name, address_phone, address_city, address_district, address_street,
      subtotal: String(subtotal),
      shipping: String(shipping),
      total: String(total),
    }).returning();

    await db.insert(orderItemsTable).values(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        name: item.name,
        brand: item.brand,
        price: String(item.price),
        qty: item.qty,
        color: item.color ?? "",
        image: item.image ?? "",
      }))
    );

    /* Award loyalty points — 10 نقطة per confirmed order (non-critical) */
    try {
      await db.update(usersTable)
        .set({ points: sql`${usersTable.points} + 10` })
        .where(eq(usersTable.id, userId));
    } catch { /* Points award is non-critical — order already confirmed */ }

    res.status(201).json({ orderId: `NKH-${String(order.id).padStart(6, "0")}`, total: order.total });
  } catch (err) { next(err); }
});

export default router;
