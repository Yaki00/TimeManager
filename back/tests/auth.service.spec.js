import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import {
  verifyPassword,
  dummyVerifyPassword,
} from "../modules/auth/service.js";

// Mock bcrypt
vi.mock("bcrypt");

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyPassword", () => {
    it("should return true for valid password", async () => {
      const password = "Secret123!";
      const hash = await bcrypt.hash(password, 10);

      bcrypt.compare.mockResolvedValue(true);

      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it("should return false for invalid password", async () => {
      const password = "Secret123!";
      const wrongPassword = "WrongPassword";
      const hash = await bcrypt.hash(password, 10);

      bcrypt.compare.mockResolvedValue(false);

      const result = await verifyPassword(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });

  describe("dummyVerifyPassword", () => {
    it("should always hash password to prevent timing attacks", async () => {
      const password = "anypassword";

      bcrypt.hash.mockResolvedValue("dummy-hash");

      await dummyVerifyPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it("should handle empty password", async () => {
      const password = "";

      bcrypt.hash.mockResolvedValue("dummy-hash");

      await dummyVerifyPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });
});
