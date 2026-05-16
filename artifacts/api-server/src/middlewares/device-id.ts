import type { Request, Response, NextFunction } from "express";

export interface RequestWithDeviceId extends Request {
  deviceId: string;
}

export function requireDeviceId(req: Request, res: Response, next: NextFunction): void {
  const id = req.headers["x-device-id"];
  if (!id || typeof id !== "string" || id.trim() === "") {
    res.status(400).json({ error: "x-device-id header required" });
    return;
  }
  (req as RequestWithDeviceId).deviceId = id.trim();
  next();
}
