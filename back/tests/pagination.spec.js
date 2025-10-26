import { describe, it, expect } from "vitest";
import { parsePagination } from "../core/pagination.js";

describe("Pagination Utils", () => {
  describe("parsePagination", () => {
    it("should use default values when no query params", () => {
      const result = parsePagination({});

      expect(result.skip).toBe(0);
      expect(result.take).toBe(50);
    });

    it("should parse valid skip and take", () => {
      const query = { skip: "10", take: "25" };
      const result = parsePagination(query);

      expect(result.skip).toBe(10);
      expect(result.take).toBe(25);
    });

    it("should handle string numbers", () => {
      const query = { skip: "5", take: "15" };
      const result = parsePagination(query);

      expect(result.skip).toBe(5);
      expect(result.take).toBe(15);
    });

    it("should respect maxTake limit", () => {
      const query = { take: "500" };
      const result = parsePagination(query, { maxTake: 100 });

      expect(result.take).toBe(100);
    });

    it("should use custom defaultTake", () => {
      const query = {};
      const result = parsePagination(query, { defaultTake: 20 });

      expect(result.take).toBe(20);
    });

    it("should handle invalid skip values", () => {
      const query = { skip: "invalid", take: "10" };
      const result = parsePagination(query);

      expect(result.skip).toBe(0);
      expect(result.take).toBe(10);
    });

    it("should handle negative values", () => {
      const query = { skip: "-5", take: "-10" };
      const result = parsePagination(query);

      expect(result.skip).toBe(0);
      expect(result.take).toBe(50); // default
    });
  });
});
