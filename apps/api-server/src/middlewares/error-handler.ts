import { type Request, type Response, type NextFunction } from "express";
import { logger } from "../lib/logger";

export interface ApiError {
  error: string;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const message = err instanceof Error ? err.message : "Internal server error";

  logger.error({ err, url: req.url, method: req.method }, message);

  res.status(500).json({ error: message } satisfies ApiError);
}
