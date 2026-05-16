import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "محاولات كثيرة — حاول مرة أخرى بعد 15 دقيقة" },
  skipSuccessfulRequests: false,
});
