import { Router } from "express";
import { register, login, refresh, me } from "./controller.js";
import { requireAuth } from "./middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);

export default router;
