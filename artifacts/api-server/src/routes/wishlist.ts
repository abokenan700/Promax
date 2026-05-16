import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { wishlistItemsTable, productsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireDeviceId, type RequestWithDeviceId } from "../middlewares/device-id";

const router: IRouter = Router();

/** GET /api/wishlist — get all wishlisted products */
router.get("/wishlist", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const rows = await db
      .select({
        wishlist_id: wishlistItemsTable.id,
        created_at:  wishlistItemsTable.created_at,
        id:          productsTable.id,
        name:        productsTable.name,
        brand:       productsTable.brand,
        price:       productsTable.price,
        original_price: productsTable.original_price,
        discount:    productsTable.discount,
        image:       productsTable.image,
        is_new:      productsTable.is_new,
        rating:      productsTable.rating,
        sales:       productsTable.sales,
        colors:      productsTable.colors,
      })
      .from(wishlistItemsTable)
      .innerJoin(productsTable, eq(wishlistItemsTable.product_id, productsTable.id))
      .where(eq(wishlistItemsTable.device_id, deviceId));

    res.json(rows);
  } catch (err) { next(err); }
});

/** POST /api/wishlist/:productId — add to wishlist */
router.post("/wishlist/:productId", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const product_id = Number(req.params.productId);
    if (isNaN(product_id)) { res.status(400).json({ error: "Invalid productId" }); return; }

    const existing = await db
      .select()
      .from(wishlistItemsTable)
      .where(and(eq(wishlistItemsTable.device_id, deviceId), eq(wishlistItemsTable.product_id, product_id)))
      .limit(1);

    if (existing.length > 0) { res.status(200).json(existing[0]); return; }

    const inserted = await db
      .insert(wishlistItemsTable)
      .values({ device_id: deviceId, product_id })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (err) { next(err); }
});

/** DELETE /api/wishlist/:productId — remove from wishlist */
router.delete("/wishlist/:productId", requireDeviceId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req as RequestWithDeviceId;

    const product_id = Number(req.params.productId);
    if (isNaN(product_id)) { res.status(400).json({ error: "Invalid productId" }); return; }

    await db
      .delete(wishlistItemsTable)
      .where(and(eq(wishlistItemsTable.device_id, deviceId), eq(wishlistItemsTable.product_id, product_id)));

    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
