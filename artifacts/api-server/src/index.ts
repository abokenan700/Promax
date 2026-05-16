import app from "./app";
import { logger } from "./lib/logger";
import { appEnv } from "./config/env";

app.listen(appEnv.port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port: appEnv.port, nodeEnv: appEnv.nodeEnv }, "Server listening");
});
