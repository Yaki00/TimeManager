import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import { requireResponsableOrManager } from "../user/middleware.js";
import {
  getResponsableKPIs,
  getManagerKPIs,
  getUserKPIs,
  getCurrentUserKPIs,
} from "./controller.js";

const router = Router();

// Route pour les KPI Responsable
router.get(
  "/responsable",
  requireAuth,
  requireResponsableOrManager,
  getResponsableKPIs
);

// Route pour les KPI Manager (par équipe)
router.get("/manager/:teamId", requireAuth, getManagerKPIs);

// Route pour les KPI Utilisateur (par userId)
router.get("/user/:userId", requireAuth, getUserKPIs);

// Route pour les KPI de l'utilisateur connecté
router.get("/user", requireAuth, getCurrentUserKPIs);

export default router;
