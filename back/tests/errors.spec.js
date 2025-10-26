import { describe, it, expect } from "vitest";
import {
  AppError,
  ErrorTypes,
  createValidationError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  validateResourceExists,
  validateAuthenticatedUser,
  validateUserRole,
} from "../core/errors.js";

describe("Errors", () => {
  describe("AppError", () => {
    it("should create error with default values", () => {
      const error = new AppError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it("should create error with custom values", () => {
      const error = new AppError("Custom error", 400, "CUSTOM_CODE");
      expect(error.message).toBe("Custom error");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("CUSTOM_CODE");
      expect(error.isOperational).toBe(true);
    });

    it("should capture stack trace", () => {
      const error = new AppError("Test error");
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("Error: Test error");
    });
  });

  describe("ErrorTypes", () => {
    it("should have correct validation error type", () => {
      expect(ErrorTypes.VALIDATION_ERROR).toEqual({
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    });

    it("should have correct unauthorized error type", () => {
      expect(ErrorTypes.UNAUTHORIZED).toEqual({
        statusCode: 401,
        code: "UNAUTHORIZED",
      });
    });

    it("should have correct forbidden error type", () => {
      expect(ErrorTypes.FORBIDDEN).toEqual({
        statusCode: 403,
        code: "FORBIDDEN",
      });
    });

    it("should have correct not found error type", () => {
      expect(ErrorTypes.NOT_FOUND).toEqual({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });

    it("should have correct conflict error type", () => {
      expect(ErrorTypes.CONFLICT).toEqual({
        statusCode: 409,
        code: "CONFLICT",
      });
    });

    it("should have correct internal error type", () => {
      expect(ErrorTypes.INTERNAL_ERROR).toEqual({
        statusCode: 500,
        code: "INTERNAL_ERROR",
      });
    });
  });

  describe("createValidationError", () => {
    it("should create validation error", () => {
      const error = createValidationError("Invalid input");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("createUnauthorizedError", () => {
    it("should create unauthorized error with default message", () => {
      const error = createUnauthorizedError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Non authentifié");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("should create unauthorized error with custom message", () => {
      const error = createUnauthorizedError("Custom unauthorized message");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Custom unauthorized message");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("createForbiddenError", () => {
    it("should create forbidden error with default message", () => {
      const error = createForbiddenError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Accès refusé");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
    });

    it("should create forbidden error with custom message", () => {
      const error = createForbiddenError("Custom forbidden message");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Custom forbidden message");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
    });
  });

  describe("createNotFoundError", () => {
    it("should create not found error with default message", () => {
      const error = createNotFoundError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Ressource non trouvée");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });

    it("should create not found error with custom message", () => {
      const error = createNotFoundError("Custom not found message");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Custom not found message");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });
  });

  describe("createConflictError", () => {
    it("should create conflict error with default message", () => {
      const error = createConflictError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Conflit de ressource");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
    });

    it("should create conflict error with custom message", () => {
      const error = createConflictError("Custom conflict message");
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Custom conflict message");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
    });
  });

  describe("validateResourceExists", () => {
    it("should return resource if it exists", () => {
      const resource = { id: 1, name: "test" };
      const result = validateResourceExists(resource);
      expect(result).toBe(resource);
    });

    it("should throw not found error if resource is null", () => {
      expect(() => validateResourceExists(null)).toThrow(
        "Ressource non trouvée"
      );
    });

    it("should throw not found error if resource is undefined", () => {
      expect(() => validateResourceExists(undefined)).toThrow(
        "Ressource non trouvée"
      );
    });

    it("should throw not found error with custom resource name", () => {
      expect(() => validateResourceExists(null, "User")).toThrow(
        "User non trouvée"
      );
    });

    it("should throw not found error with custom resource name for undefined", () => {
      expect(() => validateResourceExists(undefined, "Team")).toThrow(
        "Team non trouvée"
      );
    });
  });

  describe("validateAuthenticatedUser", () => {
    it("should return user if authenticated", () => {
      const user = { id: 1, email: "test@example.com" };
      const result = validateAuthenticatedUser(user);
      expect(result).toBe(user);
    });

    it("should throw unauthorized error if user is null", () => {
      expect(() => validateAuthenticatedUser(null)).toThrow(
        "Utilisateur non authentifié"
      );
    });

    it("should throw unauthorized error if user is undefined", () => {
      expect(() => validateAuthenticatedUser(undefined)).toThrow(
        "Utilisateur non authentifié"
      );
    });

    it("should throw unauthorized error if user has no id", () => {
      const user = { email: "test@example.com" };
      expect(() => validateAuthenticatedUser(user)).toThrow(
        "Utilisateur non authentifié"
      );
    });
  });

  describe("validateUserRole", () => {
    it("should return true if user has allowed role", () => {
      const user = { id: 1, role: "Manager" };
      const allowedRoles = ["Manager", "Responsable"];
      const result = validateUserRole(user, allowedRoles);
      expect(result).toBe(true);
    });

    it("should throw unauthorized error if user is null", () => {
      const allowedRoles = ["Manager"];
      expect(() => validateUserRole(null, allowedRoles)).toThrow(
        "Utilisateur non authentifié"
      );
    });

    it("should throw unauthorized error if user has no id", () => {
      const user = { role: "Manager" };
      const allowedRoles = ["Manager"];
      expect(() => validateUserRole(user, allowedRoles)).toThrow(
        "Utilisateur non authentifié"
      );
    });

    it("should throw forbidden error if user has no role", () => {
      const user = { id: 1 };
      const allowedRoles = ["Manager"];
      expect(() => validateUserRole(user, allowedRoles)).toThrow(
        "Rôle 'undefined' non autorisé"
      );
    });

    it("should throw forbidden error if user role not in allowed roles", () => {
      const user = { id: 1, role: "Employer" };
      const allowedRoles = ["Manager", "Responsable"];
      expect(() => validateUserRole(user, allowedRoles)).toThrow(
        "Rôle 'Employer' non autorisé. Rôles autorisés: Manager, Responsable"
      );
    });
  });
});
