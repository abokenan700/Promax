import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production.");
}
if (!process.env.JWT_SECRET) {
  console.warn("[auth] WARNING: JWT_SECRET not set — using insecure dev fallback. Set JWT_SECRET before deploying.");
}
export const JWT_SECRET = process.env.JWT_SECRET ?? "nakhba_dev_only__set_JWT_SECRET_before_deploy";

export interface JwtPayload {
  userId: number;
  email:  string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "غير مصرح — يرجى تسجيل الدخول" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as Request & { user: JwtPayload }).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "الجلسة منتهية — يرجى تسجيل الدخول مجدداً" });
  }
}
