import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import { asyncHandler } from "../../core/async.js";

import { requireResponsableOrManager } from "../user/middleware.js";

import {
  createTeam,
  getTeamById,
  listTeams,
  listTeamsByOwner,
  updateTeam,
  removeTeam,
} from "./controller.js";

import { validateCreateTeam, validateUpdateTeam } from "./validators.js";
import { canManageTeam } from "./middleware.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireResponsableOrManager,
  validateCreateTeam,
  asyncHandler(createTeam)
);
router.get("/", requireAuth, asyncHandler(listTeams));
router.get("/owner/:ownerId", requireAuth, asyncHandler(listTeamsByOwner));
router.get("/:id", requireAuth, asyncHandler(getTeamById));
router.patch(
  "/:id",
  requireAuth,
  asyncHandler(canManageTeam),
  validateUpdateTeam,
  asyncHandler(updateTeam)
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(canManageTeam),
  asyncHandler(removeTeam)
);

export default router;
