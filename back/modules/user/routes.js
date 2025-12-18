import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  getCurrentUser,
  getUserByRole,
  getUserByName,
  getUserByPhoneNumber,
  getUserByContractType,
  updateUserById,
  deleteUserById,
  getCountUsers,
  getCountUsersByRole,
  getCountUsersByContractType,
  updateRoleUserById,
  updateUserTeams,
} from "./controller.js";

import { requireAuth } from "../auth/middleware.js";
import { requireResponsable, requireResponsableOrManager } from "./middleware.js";

const router = Router();

router.get("/", requireAuth, getAllUsers);
router.get("/me/info", requireAuth, getCurrentUser);
router.get("/count", requireAuth, getCountUsers);
router.get("/count/role/:role", requireAuth, getCountUsersByRole);
router.get(
  "/count/contract/:contractType",
  requireAuth,
  getCountUsersByContractType
);
router.get("/role/:role", requireAuth, getUserByRole);
router.get("/name/:name", requireAuth, getUserByName);
router.get("/phone/:phoneNumber", requireAuth, getUserByPhoneNumber);
router.get("/contract/:contractType", requireAuth, getUserByContractType);
router.get("/:id", requireAuth, getUserById);
router.patch("/:id/role", requireAuth, requireResponsable, updateRoleUserById);
router.patch("/:id/teams", requireAuth, requireResponsableOrManager, updateUserTeams);
router.put("/:id", requireAuth, updateUserById);
router.delete("/:id", requireAuth, deleteUserById);

export default router;
