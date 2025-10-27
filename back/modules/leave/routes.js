import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";

import {
  createNewLeave,
  getLeave,
  listLeaves,
  listLeavesByUser,
  listLeavesByTeam,
  updateLeave,
  setLeaveStatus,
  removeLeave,
  listManagerLeaves,
} from "./controller.js";
import { requireResponsableOrManager } from "../user/middleware.js";
import { validateCreate } from "./validators.js";

const router = Router();

router.get("/users/:userId", requireAuth, listLeavesByUser);
router.get(
  "/teams/:teamId",
  requireAuth,
  requireResponsableOrManager,
  listLeavesByTeam
);

router.post("/", validateCreate, requireAuth, createNewLeave);
router.get("/", requireAuth, requireResponsableOrManager, listLeaves);
router.get(
  "/managers",
  requireAuth,
  requireResponsableOrManager,
  listManagerLeaves
);
router.patch(
  "/:id/status",
  requireAuth,
  requireResponsableOrManager,
  setLeaveStatus
);
router.get("/:id", requireAuth, getLeave);
router.patch("/:id", requireAuth, updateLeave);
router.delete("/:id", requireAuth, removeLeave);

export default router;
