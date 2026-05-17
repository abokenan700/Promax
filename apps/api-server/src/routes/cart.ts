import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireDeviceId, type RequestWithDeviceId } from "../middlewares/device-id";

const router: IRouter = Router();

/** GET /api/cart — get all cart items with product details */
router.get("/cart", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const rows = await db
      .select({
        id:         cartItemsTable.id,
        product_id: cartItemsTable.product_id,
        qty:        cartItemsTable.qty,
        color:      cartItemsTable.color,
        updated_at: cartItemsTable.updated_at,
        name:           productsTable.name,
        brand:          productsTable.brand,
        price:          productsTable.price,
        original_price: productsTable.original_price,
        discount:       productsTable.discount,
        image:          productsTable.image,
        colors:         productsTable.colors,
        stock:          productsTable.stock,
      })
      .from(cartItemsTable)
      .innerJoin(productsTable, eq(cartItemsTable.product_id, productsTable.id))
      .where(eq(cartItemsTable.device_id, deviceId));

    res.json(rows);
  } catch (err) { next(err); }
});

/** POST /api/cart — add item or increment qty */
router.post("/cart", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const { product_id, qty = 1, color = "" } = req.body as {
      product_id?: number; qty?: number; color?: string;
    };
    if (!product_id || typeof product_id !== "number") {
      res.status(400).json({ error: "product_id required" }); return;
    }

    const existing = await db
      .select()
      .from(cartItemsTable)
      .where(and(
        eq(cartItemsTable.device_id, deviceId),
        eq(cartItemsTable.product_id, product_id),
        eq(cartItemsTable.color, color),
      ))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(cartItemsTable)
        .set({ qty: existing[0].qty + qty, updated_at: new Date() })
        .where(eq(cartItemsTable.id, existing[0].id))
        .returning();
      res.status(200).json(updated[0]);
    } else {
      const inserted = await db
        .insert(cartItemsTable)
        .values({ device_id: deviceId, product_id, qty, color })
        .returning();
      res.status(201).json(inserted[0]);
    }
  } catch (err) { next(err); }
});

/** PATCH /api/cart/product/:productId — set absolute qty (T6: sync quantity changes) */
router.patch("/cart/product/:productId", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const product_id = Number(req.params.productId);
    if (isNaN(product_id)) { res.status(400).json({ error: "Invalid productId" }); return; }

    const { qty, color = "" } = req.body as { qty?: number; color?: string };
    if (!qty || qty < 1) { res.status(400).json({ error: "qty must be >= 1" }); return; }

    const updated = await db
      .update(cartItemsTable)
      .set({ qty, updated_at: new Date() })
      .where(and(
        eq(cartItemsTable.device_id, deviceId),
        eq(cartItemsTable.product_id, product_id),
        eq(cartItemsTable.color, color),
      ))
      .returning();

    if (updated.length === 0) { res.status(404).json({ error: "Item not found" }); return; }
    res.json(updated[0]);
  } catch (err) { next(err); }
});

/** PUT /api/cart/:id — update qty by serial id */
router.put("/cart/:id", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const id = Number(req.params.id);
    const { qty } = req.body as { qty?: number };
    if (!qty || qty < 1) { res.status(400).json({ error: "qty must be >= 1" }); return; }

    const updated = await db
      .update(cartItemsTable)
      .set({ qty, updated_at: new Date() })
      .where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.device_id, deviceId)))
      .returning();

    if (updated.length === 0) { res.status(404).json({ error: "Item not found" }); return; }
    res.json(updated[0]);
  } catch (err) { next(err); }
});

/** DELETE /api/cart/product/:productId — remove by product_id + optional ?color= (T7: color-aware delete) */
router.delete("/cart/product/:productId", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const product_id = Number(req.params.productId);
    if (isNaN(product_id)) { res.status(400).json({ error: "Invalid productId" }); return; }

    const color = req.query.color as string | undefined;

    const conditions = [
      eq(cartItemsTable.device_id, deviceId),
      eq(cartItemsTable.product_id, product_id),
    ];
    if (color !== undefined) {
      conditions.push(eq(cartItemsTable.color, color));
    }

    await db.delete(cartItemsTable).where(and(...conditions));

    res.status(204).end();
  } catch (err) { next(err); }
});

/** DELETE /api/cart/:id — remove one item by serial id */
router.delete("/cart/:id", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const id = Number(req.params.id);
    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.id, id), eq(cartItemsTable.device_id, deviceId)));

    res.status(204).end();
  } catch (err) { next(err); }
});

/** DELETE /api/cart — clear entire cart */
router.delete("/cart", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    await db.delete(cartItemsTable).where(eq(cartItemsTable.device_id, deviceId));
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
