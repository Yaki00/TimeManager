import express from "express";
import cors from "cors";
import authRoutes from "./auth/routes.js";
import prisma from "./db.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

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
app.get("/db", async (_req, res) => {
  try {
    const [{ now }] = await prisma.$queryRaw`SELECT NOW() AS now`;
    res.json({ db_time: now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur DB" });
  }
});

// Routes d'authentification
app.use("/auth", authRoutes);

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
