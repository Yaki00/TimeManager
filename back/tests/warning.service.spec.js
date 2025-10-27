import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import {
  createWarning,
  findWarningById,
  findAllWarnings,
  findWarningsByUserId,
  findWarningsByStatus,
  findWarningsByDateRange,
  findWarningsByCreatedBy,
  updateWarningById,
  deleteWarningById,
  countWarnings,
  countWarningsByUserId,
  countWarningsByStatus,
  countWarningsByDateRange,
  countWarningsByCreatedBy,
} from "../modules/warning/service.js";

describe("Warning Service", () => {
  let testUsers;
  let testWarnings;

  beforeAll(async () => {
    // Créer des utilisateurs de test
    const pw = await bcrypt.hash("Secret123!", 10);

    testUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: "test-employer-warning@example.com" },
        update: {},
        create: {
          email: "test-employer-warning@example.com",
          password: pw,
          firstName: "John",
          lastName: "Doe",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000001",
          totalWarningPoints: 0,
        },
      }),
      prisma.user.upsert({
        where: { email: "test-manager-warning@example.com" },
        update: {},
        create: {
          email: "test-manager-warning@example.com",
          password: pw,
          firstName: "Jane",
          lastName: "Smith",
          role: "Manager",
          contractType: "H40",
          phoneNumber: "0600000002",
          totalWarningPoints: 0,
        },
      }),
      prisma.user.upsert({
        where: { email: "test-responsable-warning@example.com" },
        update: {},
        create: {
          email: "test-responsable-warning@example.com",
          password: pw,
          firstName: "Bob",
          lastName: "Johnson",
          role: "Responsable",
          contractType: "H35",
          phoneNumber: "0600000003",
          totalWarningPoints: 0,
        },
      }),
    ]);

    // Créer des warnings de test
    testWarnings = await Promise.all([
      prisma.warning.create({
        data: {
          status: "Alert",
          description: "Test warning 1",
          date: new Date("2024-01-15"),
          userId: testUsers[0].id,
          createdById: testUsers[1].id,
        },
      }),
      prisma.warning.create({
        data: {
          status: "Late",
          description: "Test warning 2",
          date: new Date("2024-01-16"),
          userId: testUsers[0].id,
          createdById: testUsers[2].id,
        },
      }),
      prisma.warning.create({
        data: {
          status: "UnjustifiedAbsence",
          description: "Test warning 3",
          date: new Date("2024-01-17"),
          userId: testUsers[1].id,
          createdById: testUsers[2].id,
        },
      }),
    ]);
  });

  beforeEach(async () => {
    // Réinitialiser les points de warning pour chaque test
    await prisma.user.updateMany({
      where: {
        id: { in: testUsers.map((u) => u.id) },
      },
      data: { totalWarningPoints: 0 },
    });
  });

  afterAll(async () => {
    // Nettoyer les warnings de test
    await prisma.warning.deleteMany({
      where: {
        id: { in: testWarnings.map((w) => w.id) },
      },
    });

    // Nettoyer les utilisateurs de test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers.map((u) => u.email),
        },
      },
    });
  });

  describe("createWarning", () => {
    it("should create a warning and update user points", async () => {
      const warningData = {
        status: "Alert",
        description: "Test warning creation",
        date: new Date("2024-01-20"),
        userId: testUsers[0].id,
        createdById: testUsers[1].id,
      };

      const warning = await createWarning(warningData);

      expect(warning).toBeDefined();
      expect(warning.status).toBe("Alert");
      expect(warning.description).toBe("Test warning creation");
      expect(warning.userId).toBe(testUsers[0].id);
      expect(warning.createdById).toBe(testUsers[1].id);

      // Vérifier que les points ont été mis à jour
      const user = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      expect(user.totalWarningPoints).toBe(1); // Alert = 1 point

      // Nettoyer
      await prisma.warning.delete({ where: { id: warning.id } });
    });

    it("should create a Late warning with correct points", async () => {
      const warningData = {
        status: "Late",
        description: "Late warning",
        date: new Date("2024-01-21"),
        userId: testUsers[0].id,
        createdById: testUsers[1].id,
      };

      const warning = await createWarning(warningData);

      const user = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      expect(user.totalWarningPoints).toBe(2); // Late = 2 points

      // Nettoyer
      await prisma.warning.delete({ where: { id: warning.id } });
    });

    it("should create an UnjustifiedAbsence warning with correct points", async () => {
      const warningData = {
        status: "UnjustifiedAbsence",
        description: "Absence warning",
        date: new Date("2024-01-22"),
        userId: testUsers[0].id,
        createdById: testUsers[1].id,
      };

      const warning = await createWarning(warningData);

      const user = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      expect(user.totalWarningPoints).toBe(3); // UnjustifiedAbsence = 3 points

      // Nettoyer
      await prisma.warning.delete({ where: { id: warning.id } });
    });
  });

  describe("findWarningById", () => {
    it("should find warning by id", async () => {
      const warning = await findWarningById(testWarnings[0].id);
      expect(warning).toBeDefined();
      expect(warning.id).toBe(testWarnings[0].id);
      expect(warning.status).toBe("Alert");
      expect(warning.description).toBe("Test warning 1");
    });

    it("should return null for non-existent warning", async () => {
      const warning = await findWarningById(999999);
      expect(warning).toBeNull();
    });
  });

  describe("findAllWarnings", () => {
    it("should find all warnings with default pagination", async () => {
      const warnings = await findAllWarnings();
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeGreaterThanOrEqual(3);
    });

    it("should find warnings with custom pagination", async () => {
      const warnings = await findAllWarnings({ skip: 0, take: 2 });
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeLessThanOrEqual(2);
    });
  });

  describe("findWarningsByUserId", () => {
    it("should find warnings by user id", async () => {
      const warnings = await findWarningsByUserId(testUsers[0].id);
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeGreaterThanOrEqual(2); // Au moins 2 warnings pour cet utilisateur
      expect(warnings.every((w) => w.userId === testUsers[0].id)).toBe(true);
    });

    it("should return empty array for user with no warnings", async () => {
      const warnings = await findWarningsByUserId(999999);
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBe(0);
    });
  });

  describe("findWarningsByStatus", () => {
    it("should find warnings by status", async () => {
      const warnings = await findWarningsByStatus("Alert");
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings.every((w) => w.status === "Alert")).toBe(true);
    });

    it("should return empty array for non-existent status", async () => {
      const warnings = await findWarningsByStatus("NonExistent");
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBe(0);
    });
  });

  describe("findWarningsByDateRange", () => {
    it("should find warnings in date range", async () => {
      const startDate = new Date("2024-01-15");
      const endDate = new Date("2024-01-17");

      const warnings = await findWarningsByDateRange(startDate, endDate);
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeGreaterThanOrEqual(3);
    });

    it("should return empty array for date range with no warnings", async () => {
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-01-31");

      const warnings = await findWarningsByDateRange(startDate, endDate);
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBe(0);
    });
  });

  describe("findWarningsByCreatedBy", () => {
    it("should find warnings created by user", async () => {
      const warnings = await findWarningsByCreatedBy(testUsers[1].id);
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings.every((w) => w.createdById === testUsers[1].id)).toBe(
        true
      );
    });
  });

  describe("updateWarningById", () => {
    it("should update warning and adjust user points", async () => {
      // Créer un warning temporaire
      const tempWarning = await prisma.warning.create({
        data: {
          status: "Alert",
          description: "Temp warning",
          date: new Date("2024-01-25"),
          userId: testUsers[0].id,
          createdById: testUsers[1].id,
        },
      });

      // Mettre à jour le statut
      const updatedWarning = await updateWarningById(tempWarning.id, {
        status: "Late",
      });

      expect(updatedWarning.status).toBe("Late");

      // Vérifier que les points ont été ajustés (Alert=1 -> Late=2, donc +1)
      const user = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      expect(user.totalWarningPoints).toBe(1); // +1 point pour le changement

      // Nettoyer
      await prisma.warning.delete({ where: { id: tempWarning.id } });
    });

    it("should throw error for non-existent warning", async () => {
      await expect(
        updateWarningById(999999, { status: "Alert" })
      ).rejects.toThrow("Warning non trouvé");
    });
  });

  describe("deleteWarningById", () => {
    it("should delete warning and remove user points", async () => {
      // Créer un warning temporaire
      const tempWarning = await prisma.warning.create({
        data: {
          status: "Late",
          description: "Temp warning for deletion",
          date: new Date("2024-01-26"),
          userId: testUsers[0].id,
          createdById: testUsers[1].id,
        },
      });

      const deletedWarning = await deleteWarningById(tempWarning.id);
      expect(deletedWarning.id).toBe(tempWarning.id);

      // Vérifier que les points ont été retirés
      const user = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      expect(user.totalWarningPoints).toBe(0); // Les points ont été retirés

      // Vérifier que le warning a été supprimé
      const foundWarning = await prisma.warning.findUnique({
        where: { id: tempWarning.id },
      });
      expect(foundWarning).toBeNull();
    });

    it("should throw error for non-existent warning", async () => {
      await expect(deleteWarningById(999999)).rejects.toThrow(
        "Warning non trouvé"
      );
    });
  });

  describe("countWarnings", () => {
    it("should count all warnings", async () => {
      const count = await countWarnings();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  describe("countWarningsByUserId", () => {
    it("should count warnings by user id", async () => {
      const count = await countWarningsByUserId(testUsers[0].id);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe("countWarningsByStatus", () => {
    it("should count warnings by status", async () => {
      const count = await countWarningsByStatus("Alert");
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe("countWarningsByDateRange", () => {
    it("should count warnings in date range", async () => {
      const startDate = new Date("2024-01-15");
      const endDate = new Date("2024-01-17");

      const count = await countWarningsByDateRange(startDate, endDate);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  describe("countWarningsByCreatedBy", () => {
    it("should count warnings created by user", async () => {
      const count = await countWarningsByCreatedBy(testUsers[1].id);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
});
