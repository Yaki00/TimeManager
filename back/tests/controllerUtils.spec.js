import { describe, it, expect } from "vitest";
import {
  requireAuthenticatedUser,
  requireRole,
  isManagerOrResponsable,
  isResponsable,
  validateNumericId,
  createUserResponse,
  createAuthResponse,
} from "../core/controllerUtils.js";

describe("Controller Utils", () => {
  describe("requireAuthenticatedUser", () => {
    it("should return user if authenticated", () => {
      const user = { id: 1, email: "test@example.com" };
      const result = requireAuthenticatedUser(user);
      expect(result).toBe(user);
    });

    it("should throw error if user is null", () => {
      expect(() => requireAuthenticatedUser(null)).toThrow(
        "Utilisateur non authentifié"
      );
    });

    it("should throw error if user is undefined", () => {
      expect(() => requireAuthenticatedUser(undefined)).toThrow(
        "Utilisateur non authentifié"
      );
    });

    it("should throw error if user has no id", () => {
      const user = { email: "test@example.com" };
      expect(() => requireAuthenticatedUser(user)).toThrow(
        "Utilisateur non authentifié"
      );
    });
  });

  describe("requireRole", () => {
    it("should return true if user has allowed role", () => {
      const user = { id: 1, role: "Manager" };
      const allowedRoles = ["Manager", "Responsable"];
      const result = requireRole(user, allowedRoles);
      expect(result).toBe(true);
    });

    it("should throw error if user has no role", () => {
      const user = { id: 1 };
      const allowedRoles = ["Manager"];
      expect(() => requireRole(user, allowedRoles)).toThrow("Rôle insuffisant");
    });

    it("should throw error if user role not in allowed roles", () => {
      const user = { id: 1, role: "Employer" };
      const allowedRoles = ["Manager", "Responsable"];
      expect(() => requireRole(user, allowedRoles)).toThrow("Rôle insuffisant");
    });

    it("should throw error if user is null", () => {
      const allowedRoles = ["Manager"];
      expect(() => requireRole(null, allowedRoles)).toThrow("Rôle insuffisant");
    });
  });

  describe("isManagerOrResponsable", () => {
    it("should return true for Manager", () => {
      const user = { role: "Manager" };
      expect(isManagerOrResponsable(user)).toBe(true);
    });

    it("should return true for Responsable", () => {
      const user = { role: "Responsable" };
      expect(isManagerOrResponsable(user)).toBe(true);
    });

    it("should return false for Employer", () => {
      const user = { role: "Employer" };
      expect(isManagerOrResponsable(user)).toBe(false);
    });

    it("should return false for user with no role", () => {
      const user = {};
      expect(isManagerOrResponsable(user)).toBe(false);
    });

    it("should return false for null user", () => {
      expect(isManagerOrResponsable(null)).toBe(false);
    });
  });

  describe("isResponsable", () => {
    it("should return true for Responsable", () => {
      const user = { role: "Responsable" };
      expect(isResponsable(user)).toBe(true);
    });

    it("should return false for Manager", () => {
      const user = { role: "Manager" };
      expect(isResponsable(user)).toBe(false);
    });

    it("should return false for Employer", () => {
      const user = { role: "Employer" };
      expect(isResponsable(user)).toBe(false);
    });

    it("should return false for user with no role", () => {
      const user = {};
      expect(isResponsable(user)).toBe(false);
    });

    it("should return false for null user", () => {
      expect(isResponsable(null)).toBe(false);
    });
  });

  describe("validateNumericId", () => {
    it("should return valid numeric id", () => {
      expect(validateNumericId("123")).toBe(123);
      expect(validateNumericId(456)).toBe(456);
    });

    it("should throw error for invalid string", () => {
      expect(() => validateNumericId("abc")).toThrow("ID invalide");
    });

    it("should throw error for zero", () => {
      expect(() => validateNumericId(0)).toThrow("ID invalide");
    });

    it("should throw error for negative number", () => {
      expect(() => validateNumericId(-1)).toThrow("ID invalide");
    });

    it("should throw error for Infinity", () => {
      expect(() => validateNumericId(Infinity)).toThrow("ID invalide");
    });

    it("should throw error for NaN", () => {
      expect(() => validateNumericId(NaN)).toThrow("ID invalide");
    });
  });

  describe("createUserResponse", () => {
    it("should create user response with all fields", () => {
      const user = {
        id: 1,
        email: "test@example.com",
        role: "Manager",
        lastName: "Doe",
        firstName: "John",
        phoneNumber: "1234567890",
        contractType: "H35",
        avatarUrl: "avatar.jpg",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
      };

      const result = createUserResponse(user);

      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        role: "Manager",
        lastName: "Doe",
        firstName: "John",
        phoneNumber: "1234567890",
        contractType: "H35",
        avatarUrl: "avatar.jpg",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
      });
    });

    it("should create user response with undefined fields", () => {
      const user = {
        id: 1,
        email: "test@example.com",
        role: "Manager",
      };

      const result = createUserResponse(user);

      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
        role: "Manager",
        lastName: undefined,
        firstName: undefined,
        phoneNumber: undefined,
        contractType: undefined,
        avatarUrl: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });

  describe("createAuthResponse", () => {
    it("should create auth response with tokens", () => {
      const user = {
        id: 1,
        email: "test@example.com",
        role: "Manager",
        firstName: "John",
        lastName: "Doe",
      };
      const accessToken = "access-token";
      const refreshToken = "refresh-token";

      const result = createAuthResponse(user, accessToken, refreshToken);

      expect(result).toEqual({
        user: {
          id: 1,
          email: "test@example.com",
          role: "Manager",
          firstName: "John",
          lastName: "Doe",
          phoneNumber: undefined,
          contractType: undefined,
          avatarUrl: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          tokens: {
            access: "access-token",
            refresh: "refresh-token",
          },
        },
      });
    });
  });
});
