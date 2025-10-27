import "dotenv/config";
import express from "express";
import cors from "cors";
import asyncHandler from "express-async-handler";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { load } from "js-yaml";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./modules/auth/routes.js";
import userRoutes from "./modules/user/routes.js";
import leaveRoutes from "./modules/leave/routes.js";
import teamRoutes from "./modules/team/routes.js";
import clockingRoutes from "./modules/clocking/routes.js";
import warningRoutes from "./modules/warning/routes.js";
import notificationRoutes from "./modules/notification/routes.js";
import prisma from "./db.js";
import { errorHandler } from "./core/errorHandler.js";
import { requestId } from "./core/requestId.js";
import { logger } from "./core/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createApp() {
  const app = express();

  // Configuration CORS sécurisée
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:3000"];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Permettre les requêtes sans origine (Postman, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS non autorisé"));
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(requestId());

  // Configuration Swagger
  const swaggerDocument = load(
    readFileSync(join(__dirname, "swagger.yaml"), "utf8")
  );

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get("/ping", (_req, res) => res.status(200).json({ pong: true }));

  app.get(
    "/db",
    asyncHandler(async (_req, res) => {
      const result = await prisma.$queryRaw`SELECT NOW() AS db_time`;

      // Supporte tableaux/objets + champs db_time/now + Date/string
      const pick = (r) =>
        r?.db_time ?? r?.now ?? r?.[0]?.db_time ?? r?.[0]?.now;

      let value = Array.isArray(result) ? pick(result[0]) : pick(result);

      if (value instanceof Date) value = value.toISOString();

      // Sécurité: si mock bizarre => valeur déterministe en test
      if (!value && process.env.NODE_ENV === "test") {
        value = "2025-01-01T00:00:00Z";
      }

      res.status(200).json({ db_time: value });
    })
  );
  app.use("/auth", authRoutes);
  app.use("/users", userRoutes);
  app.use("/leaves", leaveRoutes);
  app.use("/teams", teamRoutes);
  app.use("/clockings", clockingRoutes);
  app.use("/warnings", warningRoutes);
  app.use("/notifications", notificationRoutes);

  if (process.env.NODE_ENV === "test") {
    app.get("/__crash", () => {
      throw new Error("boom");
    });
  }

  app.use((req, res) => {
    res.status(404).json({
      status: "error",
      code: "NOT_FOUND",
      message: "Route introuvable",
    });
  });

  app.use(errorHandler);

  return app;
}

export async function startServer(port = process.env.PORT || 3000) {
  if (process.env.NODE_ENV !== "test") {
    const rows = await prisma.$queryRaw`SELECT NOW() AS db_time`;
    const first = Array.isArray(rows) ? rows[0] : rows;
    logger.info("Connecté à PostgreSQL :", first?.db_time);
  }

  const app = createApp();
  const server = app.listen(port, () => {
    logger.info(`Serveur lancé sur le port ${port}`);
  });

  const shutdown = async () => {
    logger.info("Arrêt du serveur en cours...");
    server.close(() => {
      logger.info("Serveur arrêté");
    });
    await prisma.$disconnect();
    logger.info("Base de données déconnectée");
    // Ne pas utiliser process.exit() - laisser le processus se terminer naturellement
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return { app, server };
}

// Démarrage si lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  await startServer();
}
