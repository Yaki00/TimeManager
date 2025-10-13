import express from "express";
import cors from "cors";
import authRoutes from "./auth/routes.js";
import userRoutes from "./modules/user/routes.js";
import prisma from "./db.js";

import { errorHandler } from "./core/errorHandler.js";
import asyncHandler from 'express-async-handler';
import { requestId } from "./core/requestId.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(requestId);

const port = process.env.PORT || 3000;

// Test de connexion à la base au démarrage
try {
  const [{ now }] = await prisma.$queryRaw`SELECT NOW() AS now`;
  console.log("Connecté à PostgreSQL :", now);
} catch (err) {
  console.error("Erreur de connexion PostgreSQL :", err);
}

// Route simple pour tester le serveur
app.get("/ping", (req, res) => res.json({ pong: true }));

// Route pour tester la base
app.get(
  "/db",
  asyncHandler(async (_req, res) => {
    const [{ now }] = await prisma.$queryRaw`SELECT NOW() AS now`;
    res.json({ db_time: now });
  })
);

// Routes d'authentification
app.use("/auth", authRoutes);

// Routes d'user
app.use("/users", userRoutes);

// 404 pour toute route non trouvée
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    code: "NOT_FOUND",
    message: "Route introuvable",
  });
});

// Middleware d’erreurs global
app.use(errorHandler);

// Lancement du serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
