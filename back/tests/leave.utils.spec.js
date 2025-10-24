import { describe, it, expect } from "vitest";
import {
  toUTCDateOnly,
  computeBusinessDays,
  validateLeaveDates,
  isManagerOrResponsable,
} from "../modules/leave/utils.js";

describe("Leave Utils", () => {
  describe("toUTCDateOnly", () => {
    it("should convert date to UTC date only", () => {
      const date = new Date("2025-01-15T14:30:00Z");
      const result = toUTCDateOnly(date);

      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCDate()).toBe(15);
    });
  });

  describe("computeBusinessDays", () => {
    it("should calculate business days correctly", () => {
      const start = new Date("2025-01-13"); // Lundi
      const end = new Date("2025-01-17"); // Vendredi

      const result = computeBusinessDays(start, end);
      expect(result).toBe(5);
    });

    it("should handle weekend correctly", () => {
      const start = new Date("2025-01-11"); // Samedi
      const end = new Date("2025-01-12"); // Dimanche

      const result = computeBusinessDays(start, end);
      expect(result).toBe(0);
    });

    it("should handle single day", () => {
      const start = new Date("2025-01-13"); // Lundi
      const end = new Date("2025-01-13"); // Lundi

      const result = computeBusinessDays(start, end);
      expect(result).toBe(1);
    });
  });

  describe("validateLeaveDates", () => {
    it("should validate correct date range", () => {
      const start = new Date("2025-01-13");
      const end = new Date("2025-01-17");

      const result = validateLeaveDates(start, end);
      expect(result).toBe(5);
    });

    it("should throw error for invalid date range", () => {
      const start = new Date("2025-01-17");
      const end = new Date("2025-01-13");

      expect(() => validateLeaveDates(start, end)).toThrow(
        "La date de début doit précéder la date de fin"
      );
    });

    it("should throw error for weekend only", () => {
      const start = new Date("2025-01-11"); // Samedi
      const end = new Date("2025-01-12"); // Dimanche

      expect(() => validateLeaveDates(start, end)).toThrow(
        "La période ne contient aucun jour ouvré"
      );
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

    it("should return false for undefined user", () => {
      expect(isManagerOrResponsable(undefined)).toBe(false);
    });
  });
});
