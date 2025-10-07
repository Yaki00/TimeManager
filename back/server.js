import express from "express";
import pg from "pg";
import cors from "cors";
import authRoutes from "./auth/routes.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const port = process.env.PORT || 3000;

// Création du pool PostgreSQL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test de connexion à la base au démarrage
try {
  const { rows } = await pool.query("SELECT NOW()");
  console.log("Connecté à PostgreSQL :", rows[0].now);
} catch (err) {
  console.error("Erreur de connexion PostgreSQL :", err);
}

// Route simple pour tester le serveur
app.get("/ping", (req, res) => res.json({ pong: true }));

// Route pour tester la base
app.get("/db", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    res.json({ db_time: rows[0].now });
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
