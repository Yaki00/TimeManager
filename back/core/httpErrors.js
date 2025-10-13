import { AppError } from "./AppError.js";

export const badRequest = (
  message = "Requête invalide",
  code = "BAD_REQUEST"
) => new AppError(message, { statusCode: 400, code });

export const unauthorized = (
  message = "Non authentifié",
  code = "UNAUTHORIZED"
) => new AppError(message, { statusCode: 401, code });

export const forbidden = (message = "Accès refusé", code = "FORBIDDEN") =>
  new AppError(message, { statusCode: 403, code });

export const notFound = (
  message = "Ressource introuvable",
  code = "NOT_FOUND"
) => new AppError(message, { statusCode: 404, code });

export const conflict = (message = "Conflit de données", code = "CONFLICT") =>
  new AppError(message, { statusCode: 409, code });

export const internal = (message = "Erreur interne", code = "INTERNAL_ERROR") =>
  new AppError(message, { statusCode: 500, code });
