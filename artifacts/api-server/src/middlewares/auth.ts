import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appEnv } from "../config/env";
import { logger } from "../lib/logger";

export const JWT_SECRET = appEnv.jwtSecret;

if (appEnv.nodeEnv !== "production" && appEnv.jwtSecret === "nakhba_dev_only__set_JWT_SECRET_before_deploy") {
  logger.warn("[auth] JWT_SECRET not set — using insecure dev fallback");
}

export interface JwtPayload {
  userId: number;
  email: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
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
