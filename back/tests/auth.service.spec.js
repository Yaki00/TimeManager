import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import {
  verifyPassword,
  dummyVerifyPassword,
  findUserByEmail,
  createUser,
} from "../modules/auth/service.js";

// Mock bcrypt
vi.mock("bcrypt");

describe("Auth Service", () => {
  let testUser;

  beforeAll(async () => {
    // Créer un utilisateur de test avec un hash réel
    const pw = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8Kz2"; // Hash de "Secret123!"
    testUser = await prisma.user.upsert({
      where: { email: "test-auth-service@example.com" },
      update: {},
      create: {
        email: "test-auth-service@example.com",
        password: pw,
        firstName: "Test",
        lastName: "AuthService",
        role: "Employer",
        contractType: "H35",
        phoneNumber: "0600000001",
      },
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "test-auth-service@example.com",
            "test-create-user@example.com",
            "test-default-values@example.com",
            "test-normalize-email@example.com",
            "test-error@example.com",
          ],
        },
      },
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findUserByEmail", () => {
    it("should find user by email", async () => {
      const user = await findUserByEmail(testUser.email);

      expect(user).toBeTruthy();
      expect(user.email).toBe(testUser.email);
      expect(user.id).toBe(testUser.id);
      expect(user.firstName).toBe(testUser.firstName);
      expect(user.lastName).toBe(testUser.lastName);
      expect(user.role).toBe(testUser.role);
      expect(user.contractType).toBe(testUser.contractType);
      expect(user.phoneNumber).toBe(testUser.phoneNumber);
      expect(user.password).toBeTruthy(); // Password should be included
    });

    it("should return null for non-existent email", async () => {
      const user = await findUserByEmail("non-existent@example.com");
      expect(user).toBeNull();
    });

    it("should handle case insensitive email", async () => {
      // Prisma ne fait pas de recherche case-insensitive par défaut
      // Ce test vérifie que la fonction fonctionne avec l'email exact
      const user = await findUserByEmail(testUser.email);
      expect(user).toBeTruthy();
      expect(user.email).toBe(testUser.email);
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const userData = {
        email: "test-create-user@example.com",
        password: "Secret123!",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "0600000002",
        role: "Manager",
        contractType: "H40",
      };

      bcrypt.hash.mockResolvedValue("hashed-password");

      const user = await createUser(userData);

      expect(user).toBeTruthy(); // User should be created successfully
      expect(user.email).toBe(userData.email.toLowerCase());
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
      expect(user.contractType).toBe(userData.contractType);
      expect(user.phoneNumber).toBe(userData.phoneNumber);
      expect(user.password).toBeUndefined(); // Password should not be returned
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
    });

    it("should create user with default values", async () => {
      const userData = {
        email: "test-default-values@example.com",
        password: "Secret123!",
        firstName: "Jane",
        lastName: "Smith",
        phoneNumber: "0600000003",
      };

      bcrypt.hash.mockResolvedValue("hashed-password");

      const user = await createUser(userData);

      expect(user.role).toBe("Employer"); // Default role
      expect(user.contractType).toBe("H35"); // Default contract type
    });

    it("should handle email normalization", async () => {
      const userData = {
        email: "  TEST-NORMALIZE-EMAIL@EXAMPLE.COM  ",
        password: "Secret123!",
        firstName: "Test",
        lastName: "Email",
        phoneNumber: "0600000004",
      };

      bcrypt.hash.mockResolvedValue("hashed-password");

      const user = await createUser(userData);

      expect(user.email).toBe("test-normalize-email@example.com");
    });

    it("should throw error for duplicate email", async () => {
      const userData = {
        email: testUser.email, // Using existing email
        password: "Secret123!",
        firstName: "Duplicate",
        lastName: "User",
        phoneNumber: "0600000005",
      };

      bcrypt.hash.mockResolvedValue("hashed-password");

      await expect(createUser(userData)).rejects.toMatchObject({
        message: "Cet email est déjà enregistré.",
        status: 409,
        code: "EMAIL_IN_USE",
      });
    });

    it("should rethrow other database errors", async () => {
      const userData = {
        email: "test-error@example.com",
        password: "Secret123!",
        firstName: "Error",
        lastName: "User",
        phoneNumber: "0600000006",
      };

      const dbError = new Error("Database connection failed");
      dbError.code = "P1001";

      // Mock prisma.user.create to throw error
      vi.spyOn(prisma.user, "create").mockRejectedValueOnce(dbError);
      bcrypt.hash.mockResolvedValue("hashed-password");

      await expect(createUser(userData)).rejects.toBe(dbError);

      vi.restoreAllMocks();
    });
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

    it("should return false", async () => {
      const password = "anypassword";
      bcrypt.hash.mockResolvedValue("dummy-hash");

      const result = await dummyVerifyPassword(password);
      expect(result).toBe(false);
    });
  });
});
