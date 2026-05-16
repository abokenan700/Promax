import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { reviewsTable, ordersTable, orderItemsTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware, type JwtPayload } from "../middlewares/auth";

type AuthReq = Request & { user: JwtPayload };

const router: IRouter = Router();

/** GET /api/v1/products/:id/reviews */
router.get("/products/:id/reviews", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) { res.status(400).json({ error: "Invalid product id" }); return; }

    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.product_id, productId))
      .orderBy(desc(reviewsTable.created_at))
      .limit(50);

    res.json(reviews);
  } catch (err) { next(err); }
});

/** POST /api/v1/products/:id/reviews — auth required, one review per user per product */
router.post("/products/:id/reviews", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId    = (req as AuthReq).user.userId;
    const productId = Number(req.params.id);
    if (isNaN(productId)) { res.status(400).json({ error: "Invalid product id" }); return; }

    const { rating, body } = req.body as { rating?: number; body?: string };
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: "التقييم يجب أن يكون بين 1 و 5" }); return;
    }
    if (!body?.trim() || body.trim().length < 10) {
      res.status(400).json({ error: "يجب أن يكون التعليق 10 أحرف على الأقل" }); return;
    }

    const existing = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(and(eq(reviewsTable.product_id, productId), eq(reviewsTable.user_id, userId)))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "لقد قيّمت هذا المنتج من قبل" }); return;
    }

    const purchasedRows = await db
      .select({ id: orderItemsTable.id })
      .from(orderItemsTable)
      .innerJoin(ordersTable, eq(orderItemsTable.order_id, ordersTable.id))
      .where(and(eq(ordersTable.user_id, userId), eq(orderItemsTable.product_id, productId)))
      .limit(1);

    const verified = purchasedRows.length > 0 ? 1 : 0;

    const [userRow] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const user_name = userRow?.name ?? "عميل نخبة";

    const [review] = await db
      .insert(reviewsTable)
      .values({ product_id: productId, user_id: userId, user_name, rating, body: body.trim(), verified })
      .returning();

    res.status(201).json(review);
  } catch (err) { next(err); }
});

export default router;
