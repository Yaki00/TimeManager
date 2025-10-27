import { AppError } from "./AppError.js";
import { Prisma } from "@prisma/client";

const isProd = process.env.NODE_ENV === "production";

export function errorHandler(err, req, res, _next) {
  const traceId =
    req.traceId || req.headers["x-request-id"] || generateTraceId();

  const normalized = normalizeError(err);

  // Log sur la console
  console.error(
    JSON.stringify({
      level: "error",
      traceId,
      method: req.method,
      path: req.originalUrl,
      statusCode: normalized.statusCode,
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      stack: isProd ? undefined : normalized.stack,
    })
  );

  const response = {
    traceId,
    status: "error",
    code: normalized.code,
    message: normalized.message,
  };

  if (normalized.details) response.details = normalized.details;
  if (!isProd && normalized.stack) response.stack = normalized.stack;

  res.status(normalized.statusCode).json(response);
}

function normalizeError(err) {
  let statusFromErr;
  if (Number.isInteger(err.statusCode)) {
    statusFromErr = err.statusCode;
  } else if (Number.isInteger(err.status)) {
    statusFromErr = err.status;
  } else {
    statusFromErr = undefined;
  }

  // Cas AppError
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode || 500,
      code: err.code || "INTERNAL_ERROR",
      message: err.message,
      details: err.details,
      stack: err.stack,
    };
  }

  // Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return {
          statusCode: 409,
          code: "UNIQUE_CONSTRAINT",
          message: "Cet élément existe déjà.",
          details: err.meta,
          stack: err.stack,
        };
      case "P2025":
        return {
          statusCode: 404,
          code: "NOT_FOUND",
          message: "Ressource introuvable.",
          details: err.meta,
          stack: err.stack,
        };
      default:
        return {
          statusCode: 400,
          code: `PRISMA_${err.code}`,
          message: "Erreur Prisma",
          details: err.meta,
          stack: err.stack,
        };
    }
  }

  // Prisma validation
  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: 400,
      code: "PRISMA_VALIDATION_ERROR",
      message: "Données invalides.",
      stack: err.stack,
    };
  }

  // Fallback
  const status = statusFromErr ?? (err.name === "ZodError" ? 400 : 500);
  return {
    statusCode: status,
    code: err.code || (status < 500 ? "BAD_REQUEST" : "INTERNAL_ERROR"),
    message: err.message || "Erreur interne du serveur",
    stack: err.stack,
  };
}

function generateTraceId() {
  // Utilise crypto.randomUUID() si disponible, sinon fallback sécurisé
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback sécurisé utilisant crypto.getRandomValues
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return (
    hex.substring(0, 8) +
    "-" +
    hex.substring(8, 12) +
    "-" +
    hex.substring(12, 16) +
    "-" +
    hex.substring(16, 20) +
    "-" +
    hex.substring(20, 32)
  );
}
