import rateLimit from "express-rate-limit";

/**
 * Rate limiter général pour toutes les routes
 * Limite : 100 requêtes par 15 minutes par IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    status: "error",
    code: "TOO_MANY_REQUESTS",
    message: "Trop de requêtes. Veuillez réessayer plus tard.",
  },
  standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
});

/**
 * Rate limiter strict pour les routes d'authentification
 * Limite : 5 tentatives par 15 minutes par IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    status: "error",
    code: "TOO_MANY_AUTH_ATTEMPTS",
    message:
      "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Compter toutes les requêtes, même les réussies
  skipFailedRequests: false, // Compter les échecs aussi
});

/**
 * Rate limiter pour les routes de refresh token
 * Limite : 10 tentatives par heure par IP
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 tentatives par IP
  message: {
    status: "error",
    code: "TOO_MANY_REFRESH_ATTEMPTS",
    message: "Trop de tentatives de refresh. Veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
