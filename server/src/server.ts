import http from "http";
import app from "./app";
import { config } from "./config/environment";
import { MongoDatabase } from "./config/database";
import { Logger } from "./utils/logger.util";

const server = http.createServer(app);

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    const db = MongoDatabase.getInstance();
    await db.connect();

    // Start listening
    server.listen(config.port, () => {
      Logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (error) {
    Logger.error("Failed to start server", error);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  Logger.info(`${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    const db = MongoDatabase.getInstance();
    await db.disconnect();
    Logger.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  Logger.error("Unhandled Rejection", reason);
});

process.on("uncaughtException", (error) => {
  Logger.error("Uncaught Exception", error);
  if (config.nodeEnv === "production") process.exit(1);
});

startServer();
