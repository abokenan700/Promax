import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { addressesTable } from "@workspace/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { authMiddleware, type JwtPayload } from "../middlewares/auth";

type AuthReq = Request & { user: JwtPayload };

const router: IRouter = Router();

/* ── GET /api/v1/addresses ─────────────────────────────────── */
router.get("/addresses", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const addresses = await db.select().from(addressesTable)
      .where(eq(addressesTable.user_id, userId))
      .orderBy(desc(addressesTable.is_default), asc(addressesTable.created_at));
    res.json(addresses);
  } catch (err) { next(err); }
});

/* ── POST /api/v1/addresses ────────────────────────────────── */
router.post("/addresses", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const { label, name, phone, city, district, street, apartment, zip, is_default } = req.body as {
      label?: string; name: string; phone: string; city: string;
      district: string; street: string; apartment?: string; zip?: string; is_default?: boolean;
    };

    if (!name?.trim() || !phone?.trim() || !city?.trim() || !district?.trim() || !street?.trim()) {
      res.status(400).json({ error: "الحقول المطلوبة ناقصة" }); return;
    }

    const existing = await db.select({ id: addressesTable.id })
      .from(addressesTable).where(eq(addressesTable.user_id, userId)).limit(1);
    const shouldDefault = !!is_default || existing.length === 0;

    if (shouldDefault) {
      await db.update(addressesTable).set({ is_default: false })
        .where(eq(addressesTable.user_id, userId));
    }

    const [addr] = await db.insert(addressesTable).values({
      user_id:    userId,
      label:      label?.trim() || "المنزل",
      name:       name.trim(),
      phone:      phone.trim(),
      city:       city.trim(),
      district:   district.trim(),
      street:     street.trim(),
      apartment:  apartment?.trim() || null,
      zip:        zip?.trim()       || null,
      is_default: shouldDefault,
    }).returning();

    res.status(201).json(addr);
  } catch (err) { next(err); }
});

/* ── PUT /api/v1/addresses/:id ─────────────────────────────── */
router.put("/addresses/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const id = Number(req.params.id);
    const { label, name, phone, city, district, street, apartment, zip, is_default } = req.body as {
      label?: string; name?: string; phone?: string; city?: string;
      district?: string; street?: string; apartment?: string; zip?: string; is_default?: boolean;
    };

    const [existing] = await db.select({ id: addressesTable.id })
      .from(addressesTable).where(and(eq(addressesTable.id, id), eq(addressesTable.user_id, userId))).limit(1);
    if (!existing) { res.status(404).json({ error: "العنوان غير موجود" }); return; }

    if (is_default) {
      await db.update(addressesTable).set({ is_default: false })
        .where(eq(addressesTable.user_id, userId));
    }

    const updates: Partial<typeof addressesTable.$inferInsert> = {
      apartment: apartment?.trim() || null,
      zip:       zip?.trim()       || null,
    };
    if (label)    updates.label    = label.trim();
    if (name)     updates.name     = name.trim();
    if (phone)    updates.phone    = phone.trim();
    if (city)     updates.city     = city.trim();
    if (district) updates.district = district.trim();
    if (street)   updates.street   = street.trim();
    if (is_default !== undefined) updates.is_default = is_default;

    const [updated] = await db.update(addressesTable).set(updates)
      .where(eq(addressesTable.id, id)).returning();
    res.json(updated);
  } catch (err) { next(err); }
});

/* ── DELETE /api/v1/addresses/:id ──────────────────────────── */
router.delete("/addresses/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const id = Number(req.params.id);

    const [existing] = await db.select({ id: addressesTable.id, is_default: addressesTable.is_default })
      .from(addressesTable).where(and(eq(addressesTable.id, id), eq(addressesTable.user_id, userId))).limit(1);
    if (!existing) { res.status(404).json({ error: "العنوان غير موجود" }); return; }

    await db.delete(addressesTable).where(eq(addressesTable.id, id));

    if (existing.is_default) {
      const [next] = await db.select({ id: addressesTable.id })
        .from(addressesTable).where(eq(addressesTable.user_id, userId))
        .orderBy(asc(addressesTable.created_at)).limit(1);
      if (next) {
        await db.update(addressesTable).set({ is_default: true }).where(eq(addressesTable.id, next.id));
      }
    }

    res.status(204).send();
  } catch (err) { next(err); }
});

/* ── PUT /api/v1/addresses/:id/set-default ─────────────────── */
router.put("/addresses/:id/set-default", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;
    const id = Number(req.params.id);

    const [existing] = await db.select({ id: addressesTable.id })
      .from(addressesTable).where(and(eq(addressesTable.id, id), eq(addressesTable.user_id, userId))).limit(1);
    if (!existing) { res.status(404).json({ error: "العنوان غير موجود" }); return; }

    await db.update(addressesTable).set({ is_default: false }).where(eq(addressesTable.user_id, userId));
    await db.update(addressesTable).set({ is_default: true }).where(eq(addressesTable.id, id));

    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
