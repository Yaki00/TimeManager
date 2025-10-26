import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import { requireResponsableOrManager } from "../user/middleware.js";

import {
  createWarning,
  getWarningById,
  getAllWarnings,
  getWarningsByUserId,
  getWarningsByStatus,
  getWarningsByDateRange,
  getWarningsByCreatedBy,
  updateWarning,
  deleteWarning,
  getCountWarnings,
  getCountWarningsByUserId,
  getCountWarningsByStatus,
  getCountWarningsByDateRange,
  getCountWarningsByCreatedBy,
} from "./controller.js";

import {
  validateCreateWarning,
  validateUpdateWarning,
  validateWarningId,
  validateUserId,
  validateWarningStatus,
  validateDateRange,
} from "./validators.js";

const router = Router();

// Routes pour la création
router.post(
  "/",
  requireAuth,
  requireResponsableOrManager,
  validateCreateWarning,
  createWarning
);

// Routes pour récupérer les warnings
router.get("/", requireAuth, getAllWarnings);

// Routes de comptage
router.get("/count", requireAuth, getCountWarnings);
router.get(
  "/count/user/:userId",
  requireAuth,
  validateUserId,
  getCountWarningsByUserId
);
router.get(
  "/count/status/:status",
  requireAuth,
  validateWarningStatus,
  getCountWarningsByStatus
);
router.get(
  "/count/date-range",
  requireAuth,
  validateDateRange,
  getCountWarningsByDateRange
);
router.get(
  "/count/created-by/:createdById",
  requireAuth,
  validateUserId,
  getCountWarningsByCreatedBy
);

// Routes pour récupérer les warnings par critères
router.get("/user/:userId", requireAuth, validateUserId, getWarningsByUserId);
router.get(
  "/status/:status",
  requireAuth,
  validateWarningStatus,
  getWarningsByStatus
);
router.get(
  "/date-range",
  requireAuth,
  validateDateRange,
  getWarningsByDateRange
);
router.get(
  "/created-by/:createdById",
  requireAuth,
  validateUserId,
  getWarningsByCreatedBy
);

// Routes pour un warning spécifique (doit être en dernier)
router.get("/:id", requireAuth, validateWarningId, getWarningById);
router.patch(
  "/:id",
  requireAuth,
  validateWarningId,
  validateUpdateWarning,
  updateWarning
);
router.delete("/:id", requireAuth, validateWarningId, deleteWarning);

export default router;
