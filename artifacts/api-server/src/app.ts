import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler } from "./middlewares/error-handler";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const isDev = process.env.NODE_ENV !== "production";
app.use(cors({
  origin: isDev
    ? true
    : (process.env.ALLOWED_ORIGIN ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-device-id"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* مشكلة 150: API versioning — /api/v1 يحمي العملاء القدامى عند التغييرات الجوهرية */
app.use("/api/v1", router);

app.use(errorHandler);

export default app;
