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
} from "./controller.js";
import { requireResponsableOrManager } from "../user/middleware.js";

const router = Router();
router.use(requireAuth);

router.get("/users/:userId", listLeavesByUser);
router.get("/teams/:teamId", requireResponsableOrManager, listLeavesByTeam);

router.post("/", createNewLeave);
router.get("/", requireResponsableOrManager, listLeaves);
router.get("/:id", getLeave);
router.patch("/:id", updateLeave);
router.patch("/:id/status", requireResponsableOrManager, setLeaveStatus);
router.delete("/:id", removeLeave);

export default router;
