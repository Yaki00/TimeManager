import Tokens from "csrf";
import { badRequest, forbidden } from "./httpErrors.js";

const tokens = new Tokens();

/**
 * Middleware CSRF - génère un token CSRF et le stocke dans un cookie
 * Le token doit être renvoyé dans le header X-CSRF-Token pour les requêtes mutantes
 */
export function csrfToken() {
  return (req, res, next) => {
    // Générer un secret unique pour cette session si non présent
    let secret = req.cookies?._csrf;

    if (!secret) {
      secret = tokens.secretSync();
      res.cookie("_csrf", secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24, // 24 heures
      });
    }

    // Générer le token CSRF
    const token = tokens.create(secret);

    // Stocker le token dans res.locals pour qu'il puisse être utilisé
    res.locals.csrfToken = token;

    // Ajouter le token dans un header personnalisé
    res.setHeader("X-CSRF-Token", token);

    next();
  };
}

/**
 * Middleware de vérification CSRF - vérifie le token pour les requêtes mutantes
 * À utiliser uniquement sur les routes POST, PUT, DELETE, PATCH
 */
export function csrfProtection() {
  return (req, res, next) => {
    // Vérifier uniquement les méthodes mutantes
    const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];

    if (!mutatingMethods.includes(req.method)) {
      return next();
    }

    // Exclure certaines routes qui n'ont pas besoin de CSRF
    const excludedPaths = ["/api-docs", "/ping", "/db"];
    if (excludedPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const secret = req.cookies?._csrf;
    const token = req.headers["x-csrf-token"] || req.body?._csrf;

    if (!secret || !token) {
      return next(
        forbidden(
          "Token CSRF manquant. Veuillez inclure le header X-CSRF-Token.",
          "CSRF_TOKEN_MISSING"
        )
      );
    }

    if (!tokens.verify(secret, token)) {
      return next(
        badRequest(
          "Token CSRF invalide. Veuillez recharger la page.",
          "CSRF_TOKEN_INVALID"
        )
      );
    }

    next();
  };
}
