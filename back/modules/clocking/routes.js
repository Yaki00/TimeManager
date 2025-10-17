import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import { asyncHandler } from "../../core/async.js";

import {
  canCreateClocking,
  canManageClocking,
  canViewUserClockings,
} from "./middleware.js";

import {
  createClocking,
  getClockingById,
  listClockings,
  listClockingsByUser,
  getClockingsByUserAndDate,
  updateClocking,
  removeClocking,
  getUserClockingStats,
} from "./controller.js";

import {
  validateCreateClocking,
  validateUpdateClocking,
} from "./validators.js";

const router = Router();

// Créer un pointage (tous les utilisateurs authentifiés pour eux-mêmes)
router.post(
  "/",
  requireAuth,
  validateCreateClocking,
  asyncHandler(canCreateClocking),
  asyncHandler(createClocking)
);

// Lister tous les pointages (Responsable uniquement, avec filtres)
router.get("/", requireAuth, asyncHandler(listClockings));

// Lister les pointages d'un utilisateur spécifique
router.get(
  "/user/:userId",
  requireAuth,
  asyncHandler(canViewUserClockings),
  asyncHandler(listClockingsByUser)
);

// Obtenir les statistiques de pointage d'un utilisateur
router.get(
  "/user/:userId/stats",
  requireAuth,
  asyncHandler(canViewUserClockings),
  asyncHandler(getUserClockingStats)
);

// Obtenir les pointages d'un utilisateur pour une date (peut être plusieurs)
router.get(
  "/user/:userId/date/:date",
  requireAuth,
  asyncHandler(canViewUserClockings),
  asyncHandler(getClockingsByUserAndDate)
);

// Obtenir un pointage par ID
router.get("/:id", requireAuth, asyncHandler(getClockingById));

// Mettre à jour un pointage
router.patch(
  "/:id",
  requireAuth,
  asyncHandler(canManageClocking),
  validateUpdateClocking,
  asyncHandler(updateClocking)
);

// Supprimer un pointage
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(canManageClocking),
  asyncHandler(removeClocking)
);

export default router;
