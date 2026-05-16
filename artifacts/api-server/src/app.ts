import { type Express } from "express";
import router from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { createHttpApp } from "./bootstrap/http";

const app: Express = createHttpApp();

/* مشكلة 150: API versioning — /api/v1 يحمي العملاء القدامى عند التغييرات الجوهرية */
app.use("/api/v1", router);

app.use(errorHandler);

export default app;
