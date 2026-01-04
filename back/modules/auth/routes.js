import { Router } from "express";
import { register, login, refresh, me } from "./controller.js";
import { requireAuth } from "./middleware.js";
import { authRateLimiter, refreshRateLimiter } from "../../core/rateLimit.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/refresh", refreshRateLimiter, refresh);
router.get("/me", requireAuth, me);

export default router;
