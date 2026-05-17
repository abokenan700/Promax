import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, or, isNull, desc } from "drizzle-orm";
import { authMiddleware, type JwtPayload } from "../middlewares/auth";

type AuthReq = Request & { user: JwtPayload };

const router: IRouter = Router();

/* ── GET /api/v1/notifications ──────────────────────────── */
router.get("/notifications", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthReq).user.userId;

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(
        or(
          eq(notificationsTable.user_id, userId),
          isNull(notificationsTable.user_id)
        )
      )
      .orderBy(desc(notificationsTable.created_at))
      .limit(50);

    res.json(rows);
  } catch (err) { next(err); }
});

/* ── PATCH /api/v1/notifications/:id/read ───────────────── */
router.patch("/notifications/:id/read", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    await db
      .update(notificationsTable)
      .set({ read: "true" })
      .where(eq(notificationsTable.id, id));

    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
