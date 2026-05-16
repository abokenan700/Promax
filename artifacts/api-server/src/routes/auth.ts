import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { JWT_SECRET, authMiddleware, type JwtPayload } from "../middlewares/auth";

const router: IRouter = Router();

/* ── POST /auth/register ────────────────────────────────────── */
router.post("/auth/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      res.status(400).json({ error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      return;
    }

    const existing = await db.select({ id: usersTable.id })
      .from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable)
      .values({ name: name.trim(), email: email.toLowerCase(), password_hash })
      .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email });

    const token = jwt.sign({ userId: user.id, email: user.email } satisfies JwtPayload, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

/* ── POST /auth/login ───────────────────────────────────────── */
router.post("/auth/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as Record<string, string>;

    if (!email?.trim() || !password?.trim()) {
      res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      return;
    }

    const [user] = await db.select()
      .from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (!user) {
      res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email } satisfies JwtPayload, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

/* ── GET /auth/me ───────────────────────────────────────────── */
router.get("/auth/me", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as Request & { user: JwtPayload }).user;
    const [user] = await db.select({
      id: usersTable.id, name: usersTable.name,
      email: usersTable.email, avatar: usersTable.avatar, created_at: usersTable.created_at,
    }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!user) { res.status(404).json({ error: "المستخدم غير موجود" }); return; }
    res.json(user);
  } catch (err) { next(err); }
});

/* ── POST /auth/forgot-password (T26) ──────────────────────── */
router.post("/auth/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      res.status(400).json({ error: "البريد الإلكتروني مطلوب" }); return;
    }

    const [user] = await db.select({ id: usersTable.id, email: usersTable.email })
      .from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (!user) {
      res.json({ message: "إذا كان البريد مسجلاً، ستصلك رسالة بالرمز" }); return;
    }

    const otp     = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db.update(usersTable)
      .set({ reset_otp: otp, reset_otp_exp: expires })
      .where(eq(usersTable.id, user.id));

    res.json({
      message: "إذا كان البريد مسجلاً، ستصلك رسالة بالرمز",
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (err) { next(err); }
});

/* ── POST /auth/reset-password (T26) ───────────────────────── */
router.post("/auth/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body as { email?: string; otp?: string; newPassword?: string };

    if (!email?.trim() || !otp?.trim() || !newPassword?.trim()) {
      res.status(400).json({ error: "جميع الحقول مطلوبة" }); return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }); return;
    }

    const [user] = await db.select()
      .from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (!user || user.reset_otp !== otp) {
      res.status(400).json({ error: "الرمز غير صحيح" }); return;
    }
    if (!user.reset_otp_exp || user.reset_otp_exp < new Date()) {
      res.status(400).json({ error: "انتهت صلاحية الرمز — اطلب رمزاً جديداً" }); return;
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable)
      .set({ password_hash, reset_otp: null, reset_otp_exp: null })
      .where(eq(usersTable.id, user.id));

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) { next(err); }
});

/* ── PATCH /auth/change-password (T26 - logged in) ─────────── */
router.patch("/auth/change-password", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as Request & { user: JwtPayload }).user;
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

    if (!currentPassword?.trim() || !newPassword?.trim()) {
      res.status(400).json({ error: "كلمة المرور الحالية والجديدة مطلوبتان" }); return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }); return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "المستخدم غير موجود" }); return; }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) { res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" }); return; }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await db.update(usersTable).set({ password_hash }).where(eq(usersTable.id, userId));

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) { next(err); }
});

/* ── PATCH /users/me/avatar ──────────────────────────────────── */
router.patch("/users/me/avatar", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as Request & { user: JwtPayload }).user;
    const { avatar } = req.body as { avatar?: string | null };

    if (avatar !== null && avatar !== undefined) {
      if (typeof avatar !== "string") {
        res.status(400).json({ error: "صيغة الصورة غير صحيحة" }); return;
      }
      if (avatar.length > 500_000) {
        res.status(413).json({ error: "حجم الصورة كبير جداً، يُرجى اختيار صورة أصغر" }); return;
      }
      if (avatar !== "" && !avatar.startsWith("data:image/")) {
        res.status(400).json({ error: "يجب أن تكون الصورة بصيغة صحيحة" }); return;
      }
    }

    const [updated] = await db.update(usersTable)
      .set({ avatar: avatar || null })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id, avatar: usersTable.avatar });

    if (!updated) { res.status(404).json({ error: "المستخدم غير موجود" }); return; }
    res.json({ avatar: updated.avatar });
  } catch (err) { next(err); }
});

/* ── PATCH /users/me ─────────────────────────────────────────── */
router.patch("/users/me", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as Request & { user: JwtPayload }).user;
    const { name, email } = req.body as { name?: string; email?: string };

    if (!name?.trim() && !email?.trim()) {
      res.status(400).json({ error: "يجب تقديم اسم أو بريد إلكتروني للتحديث" }); return;
    }

    const updates: Partial<{ name: string; email: string }> = {};
    if (name?.trim()) updates.name = name.trim();
    if (email?.trim()) {
      const emailLower = email.toLowerCase().trim();
      const existing = await db.select({ id: usersTable.id })
        .from(usersTable).where(eq(usersTable.email, emailLower)).limit(1);
      if (existing.length > 0 && existing[0].id !== userId) {
        res.status(409).json({ error: "هذا البريد الإلكتروني مستخدم بالفعل من حساب آخر" }); return;
      }
      updates.email = emailLower;
    }

    const [updated] = await db.update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email });

    if (!updated) { res.status(404).json({ error: "المستخدم غير موجود" }); return; }
    res.json({ user: updated });
  } catch (err) { next(err); }
});

/* ── GET /api/v1/users/me/points ────────────────────────────── */
router.get("/users/me/points", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as Request & { user: JwtPayload }).user;
    const [user] = await db
      .select({ points: usersTable.points })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user) { res.status(404).json({ error: "المستخدم غير موجود" }); return; }
    res.json({ points: user.points ?? 0 });
  } catch (err) { next(err); }
});

export default router;
