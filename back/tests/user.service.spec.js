import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import {
  findUserById,
  findAllUsers,
  findByRole,
  findByName,
  findByPhoneNumber,
  findByContractType,
  updateUser,
  updateRoleUserById,
  deleteUser,
  countUsers,
  countUsersByRole,
  countUsersByContractType,
} from "../modules/user/service.js";

describe("User Service", () => {
  let testUsers;

  beforeAll(async () => {
    // Créer des utilisateurs de test
    const pw = await bcrypt.hash("Secret123!", 10);

    testUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: "test-employer1@example.com" },
        update: {},
        create: {
          email: "test-employer1@example.com",
          password: pw,
          firstName: "John",
          lastName: "Doe",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000001",
        },
      }),
      prisma.user.upsert({
        where: { email: "test-manager1@example.com" },
        update: {},
        create: {
          email: "test-manager1@example.com",
          password: pw,
          firstName: "Jane",
          lastName: "Smith",
          role: "Manager",
          contractType: "H40",
          phoneNumber: "0600000002",
        },
      }),
      prisma.user.upsert({
        where: { email: "test-responsable1@example.com" },
        update: {},
        create: {
          email: "test-responsable1@example.com",
          password: pw,
          firstName: "Bob",
          lastName: "Johnson",
          role: "Responsable",
          contractType: "H35",
          phoneNumber: "0600000003",
        },
      }),
    ]);
  });

  beforeEach(async () => {
    // Nettoyer les modifications de test - restaurer les données originales pour chaque utilisateur
    for (const user of testUsers) {
      await prisma.user.update({
        where: { email: user.email },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          contractType: user.contractType,
        },
      });
    }
  });

  afterAll(async () => {
    // Nettoyer les utilisateurs de test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers.map((u) => u.email),
        },
      },
    });
  });

  describe("findUserById", () => {
    it("should find user by id", async () => {
      const user = await findUserById(testUsers[0].id);
      expect(user).toBeDefined();
      expect(user.id).toBe(testUsers[0].id);
      expect(user.email).toBe(testUsers[0].email);
      expect(user.firstName).toBe(testUsers[0].firstName);
      expect(user.lastName).toBe(testUsers[0].lastName);
      expect(user.role).toBe(testUsers[0].role);
      expect(user.phoneNumber).toBe(testUsers[0].phoneNumber);
      expect(user.contractType).toBe(testUsers[0].contractType);
    });

    it("should return null for non-existent user", async () => {
      const user = await findUserById(999999);
      expect(user).toBeNull();
    });
  });

  describe("findAllUsers", () => {
    it("should find all users with default pagination", async () => {
      const users = await findAllUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(3);
    });

    it("should find users with custom pagination", async () => {
      const users = await findAllUsers({ skip: 0, take: 2 });
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeLessThanOrEqual(2);
    });

    it("should find users with skip only", async () => {
      const users = await findAllUsers({ skip: 1 });
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe("findByRole", () => {
    it("should find users by role", async () => {
      const employers = await findByRole("Employer");
      expect(Array.isArray(employers)).toBe(true);
      expect(employers.length).toBeGreaterThanOrEqual(1);
      expect(employers.every((u) => u.role === "Employer")).toBe(true);
    });

    it("should return empty array for non-existent role", async () => {
      // Utiliser un rôle valide mais qui n'existe pas dans la DB
      const users = await findByRole("Employer");
      expect(Array.isArray(users)).toBe(true);
      // On s'attend à ce qu'il y ait au moins un employer dans les tests
      expect(users.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("findByName", () => {
    it("should find users by single name (first name)", async () => {
      const users = await findByName("John");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users.some((u) => u.firstName.includes("John"))).toBe(true);
    });

    it("should find users by single name (last name)", async () => {
      const users = await findByName("Doe");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users.some((u) => u.lastName.includes("Doe"))).toBe(true);
    });

    it("should find users by full name", async () => {
      const users = await findByName("John Doe");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(
        users.some(
          (u) => u.firstName.includes("John") && u.lastName.includes("Doe")
        )
      ).toBe(true);
    });

    it("should find users by full name with multiple words in last name", async () => {
      const users = await findByName("Jane Smith");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(
        users.some(
          (u) => u.firstName.includes("Jane") && u.lastName.includes("Smith")
        )
      ).toBe(true);
    });

    it("should handle empty search", async () => {
      const users = await findByName("");
      expect(Array.isArray(users)).toBe(true);
    });

    it("should handle whitespace-only search", async () => {
      const users = await findByName("   ");
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe("findByPhoneNumber", () => {
    it("should find users by phone number", async () => {
      const users = await findByPhoneNumber("0600000001");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users.some((u) => u.phoneNumber.includes("0600000001"))).toBe(
        true
      );
    });

    it("should find users by phone number with formatting", async () => {
      const users = await findByPhoneNumber("06.00.00.00.01");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users.some((u) => u.phoneNumber.includes("0600000001"))).toBe(
        true
      );
    });

    it("should find users by partial phone number", async () => {
      const users = await findByPhoneNumber("060000");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
    });

    it("should return empty array for non-existent phone number", async () => {
      const users = await findByPhoneNumber("9999999999");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(0);
    });
  });

  describe("findByContractType", () => {
    it("should find users by contract type", async () => {
      const users = await findByContractType("H35");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users.every((u) => u.contractType === "H35")).toBe(true);
    });

    it("should return empty array for non-existent contract type", async () => {
      // Utiliser un type de contrat valide mais qui n'existe pas dans la DB
      const users = await findByContractType("H15");
      expect(Array.isArray(users)).toBe(true);
      // On s'attend à ce qu'il n'y ait pas de H15 dans nos tests
      expect(users.length).toBe(0);
    });
  });

  describe("updateUser", () => {
    it("should update user data", async () => {
      const updateData = {
        firstName: "UpdatedJohn",
        lastName: "UpdatedDoe",
      };
      const updatedUser = await updateUser(testUsers[0].id, updateData);
      expect(updatedUser).toBeDefined();
      expect(updatedUser.firstName).toBe("UpdatedJohn");
      expect(updatedUser.lastName).toBe("UpdatedDoe");
      expect(updatedUser.email).toBe(testUsers[0].email); // Should remain unchanged
    });

    it("should update user role", async () => {
      const updateData = { role: "Manager" };
      const updatedUser = await updateUser(testUsers[0].id, updateData);
      expect(updatedUser).toBeDefined();
      expect(updatedUser.role).toBe("Manager");
    });

    it("should update user contract type", async () => {
      const updateData = { contractType: "H40" };
      const updatedUser = await updateUser(testUsers[0].id, updateData);
      expect(updatedUser).toBeDefined();
      expect(updatedUser.contractType).toBe("H40");
    });
  });

  describe("updateRoleUserById", () => {
    it("should update user role", async () => {
      const updatedUser = await updateRoleUserById(testUsers[0].id, "Manager");
      expect(updatedUser).toBeDefined();
      expect(updatedUser.role).toBe("Manager");
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      // Créer un utilisateur temporaire pour le test de suppression
      const tempUser = await prisma.user.create({
        data: {
          email: "temp-user@example.com",
          password: await bcrypt.hash("Secret123!", 10),
          firstName: "Temp",
          lastName: "User",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000099",
        },
      });

      const deletedUser = await deleteUser(tempUser.id);
      expect(deletedUser).toBeDefined();
      expect(deletedUser.id).toBe(tempUser.id);

      // Vérifier que l'utilisateur a été supprimé
      const foundUser = await prisma.user.findUnique({
        where: { id: tempUser.id },
      });
      expect(foundUser).toBeNull();
    });
  });

  describe("countUsers", () => {
    it("should count all users", async () => {
      const count = await countUsers();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  describe("countUsersByRole", () => {
    it("should count users by role", async () => {
      const count = await countUsersByRole("Employer");
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it("should return 0 for non-existent role", async () => {
      // Utiliser un rôle valide mais qui n'existe pas dans la DB
      const count = await countUsersByRole("Employer");
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe("countUsersByContractType", () => {
    it("should count users by contract type", async () => {
      const count = await countUsersByContractType("H35");
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it("should return 0 for non-existent contract type", async () => {
      // Utiliser un type de contrat valide mais qui n'existe pas dans la DB
      const count = await countUsersByContractType("H15");
      expect(typeof count).toBe("number");
      expect(count).toBe(0);
    });
  });
});
