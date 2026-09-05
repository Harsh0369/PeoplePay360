import * as dotenv from "dotenv";
dotenv.config();

// --- Startup validation for required env vars ---
const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "PORT",
  "JWT_SECRET",
] as const;

for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    throw new Error(`❌ Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),

  mongodb: {
    uri: process.env.MONGODB_URI as string,
  },

  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  },

  cors: {
    origins: process.env.CORS_ORIGINS || (process.env.NODE_ENV === "production" ? "" : "*"),
  },
} as const;

// --- Validate CORS in production ---
if (config.nodeEnv === "production" && (!config.cors.origins || config.cors.origins === "*")) {
  throw new Error('❌ CORS_ORIGINS must be explicitly set in production (not "*")');
}
