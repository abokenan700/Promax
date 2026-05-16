export type AppEnv = {
  nodeEnv: "development" | "production" | "test";
  allowedOrigins: true | string[];
  jwtSecret: string;
  port: number;
};

function normalizeNodeEnv(raw: string | undefined): AppEnv["nodeEnv"] {
  if (raw === "production" || raw === "test") return raw;
  return "development";
}

function parseAllowedOrigins(nodeEnv: AppEnv["nodeEnv"], raw: string | undefined): AppEnv["allowedOrigins"] {
  if (nodeEnv !== "production") return true;

  const origins = (raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("ALLOWED_ORIGIN must be set in production (comma-separated origins).");
  }

  return origins;
}

function parseJwtSecret(nodeEnv: AppEnv["nodeEnv"], raw: string | undefined): string {
  if (raw && raw.trim().length > 0) return raw.trim();
  if (nodeEnv === "production") {
    throw new Error("JWT_SECRET must be set in production.");
  }
  return "nakhba_dev_only__set_JWT_SECRET_before_deploy";
}

function parsePort(raw: string | undefined): number {
  if (!raw) throw new Error("PORT environment variable is required but was not provided.");
  const port = Number(raw);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: \"${raw}\"`);
  }
  return port;
}

const nodeEnv = normalizeNodeEnv(process.env.NODE_ENV);

export const appEnv: AppEnv = {
  nodeEnv,
  allowedOrigins: parseAllowedOrigins(nodeEnv, process.env.ALLOWED_ORIGIN),
  jwtSecret: parseJwtSecret(nodeEnv, process.env.JWT_SECRET),
  port: parsePort(process.env.PORT),
};
