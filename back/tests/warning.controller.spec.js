import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";
import bcrypt from "bcrypt";
import prisma from "../db.js";

describe("Warning Controller Routes", () => {
  let testUsers;
  let testWarnings;
  let app;

  beforeAll(async () => {
    app = createApp();
    const pw = await bcrypt.hash("Secret123!", 10);

    // Créer des utilisateurs de test
    testUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: "test-employer-warning-controller@example.com" },
        update: {},
        create: {
          email: "test-employer-warning-controller@example.com",
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
        where: { email: "test-manager-warning-controller@example.com" },
        update: {},
        create: {
          email: "test-manager-warning-controller@example.com",
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
        where: { email: "test-responsable-warning-controller@example.com" },
        update: {},
        create: {
          email: "test-responsable-warning-controller@example.com",
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
          description: "Test warning controller 1",
          date: new Date("2024-01-15"),
          userId: testUsers[0].id,
          createdById: testUsers[1].id,
        },
      }),
      prisma.warning.create({
        data: {
          status: "Late",
          description: "Test warning controller 2",
          date: new Date("2024-01-16"),
          userId: testUsers[0].id,
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

  describe("POST /warnings", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).post("/warnings").send({
        status: "Alert",
        description: "Test warning",
        date: "2024-01-20",
        userId: testUsers[0].id,
      });
      expect([401, 403]).toContain(res.status);
    });

    it("should create warning with manager token", async () => {
      const token = signAccessToken({
        id: testUsers[1].id,
        email: testUsers[1].email,
        role: testUsers[1].role,
      });

      const res = await request(app)
        .post("/warnings")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          status: "Alert",
          description: "Test warning creation",
          date: "2024-01-20",
          userId: testUsers[0].id,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.status).toBe("Alert");
      expect(res.body.description).toBe("Test warning creation");
      expect(res.body.userId).toBe(testUsers[0].id);
      expect(res.body.createdById).toBe(testUsers[1].id);

      // Nettoyer
      await prisma.warning.delete({ where: { id: res.body.id } });
    });

    it("should create warning with responsable token", async () => {
      const token = signAccessToken({
        id: testUsers[2].id,
        email: testUsers[2].email,
        role: testUsers[2].role,
      });

      const res = await request(app)
        .post("/warnings")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          status: "Late",
          description: "Test warning from responsable",
          date: "2024-01-21",
          userId: testUsers[0].id,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("Late");

      // Nettoyer
      await prisma.warning.delete({ where: { id: res.body.id } });
    });

    it("should return 403 for employer trying to create warning", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .post("/warnings")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          status: "Alert",
          description: "Test warning",
          date: "2024-01-20",
          userId: testUsers[1].id,
        });

      expect(res.status).toBe(403);
    });

    it("should return 400 for invalid warning data", async () => {
      const token = signAccessToken({
        id: testUsers[1].id,
        email: testUsers[1].email,
        role: testUsers[1].role,
      });

      const res = await request(app)
        .post("/warnings")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          status: "InvalidStatus",
          description: "Test warning",
          date: "2024-01-20",
          userId: testUsers[0].id,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 when trying to create warning for self", async () => {
      const token = signAccessToken({
        id: testUsers[1].id,
        email: testUsers[1].email,
        role: testUsers[1].role,
      });

      const res = await request(app)
        .post("/warnings")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          status: "Alert",
          description: "Test warning",
          date: "2024-01-20",
          userId: testUsers[1].id, // Même ID que le créateur
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /warnings", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/warnings");
      expect([401, 403]).toContain(res.status);
    });

    it("should return warnings with valid token", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle pagination parameters", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings?skip=0&take=1")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe("GET /warnings/:id", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get(`/warnings/${testWarnings[0].id}`);
      expect([401, 403]).toContain(res.status);
    });

    it("should return warning by valid ID", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get(`/warnings/${testWarnings[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", testWarnings[0].id);
      expect(res.body).toHaveProperty("status", "Alert");
      expect(res.body).toHaveProperty(
        "description",
        "Test warning controller 1"
      );
    });

    it("should return 400 for invalid ID", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings/invalid")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent warning", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings/999999")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
    });
  });

  describe("GET /warnings/user/:userId", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get(`/warnings/user/${testUsers[0].id}`);
      expect([401, 403]).toContain(res.status);
    });

    it("should return warnings by user ID", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get(`/warnings/user/${testUsers[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body.every((w) => w.userId === testUsers[0].id)).toBe(true);
    });

    it("should return 400 for invalid user ID", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings/user/invalid")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
    });
  });

  describe("GET /warnings/status/:status", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/warnings/status/Alert");
      expect([401, 403]).toContain(res.status);
    });

    it("should return warnings by status", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings/status/Alert")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((w) => w.status === "Alert")).toBe(true);
    });

    it("should return 400 for invalid status", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings/status/InvalidStatus")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /warnings/:id", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app)
        .patch(`/warnings/${testWarnings[0].id}`)
        .send({ description: "Updated description" });
      expect([401, 403]).toContain(res.status);
    });

    it("should update warning successfully", async () => {
      const token = signAccessToken({
        id: testUsers[1].id, // Créateur du warning
        email: testUsers[1].email,
        role: testUsers[1].role,
      });

      const res = await request(app)
        .patch(`/warnings/${testWarnings[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          description: "Updated description",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("description", "Updated description");
    });

    it("should allow manager to update any warning", async () => {
      const token = signAccessToken({
        id: testUsers[1].id,
        email: testUsers[1].email,
        role: testUsers[1].role,
      });

      const res = await request(app)
        .patch(`/warnings/${testWarnings[1].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          description: "Updated by manager",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("description", "Updated by manager");
    });

    it("should return 403 for unauthorized user", async () => {
      const token = signAccessToken({
        id: testUsers[0].id, // Employer qui n'est pas le créateur
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .patch(`/warnings/${testWarnings[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          description: "Unauthorized update",
        });

      expect(res.status).toBe(403);
    });

    it("should return 400 for invalid ID", async () => {
      const token = signAccessToken({
        id: testUsers[1].id,
        email: testUsers[1].email,
        role: testUsers[1].role,
      });

      const res = await request(app)
        .patch("/warnings/invalid")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          description: "Test",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /warnings/:id", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).delete(`/warnings/${testWarnings[0].id}`);
      expect([401, 403]).toContain(res.status);
    });

    it("should delete warning successfully", async () => {
      // Créer un warning temporaire pour le test de suppression
      const tempWarning = await prisma.warning.create({
        data: {
          status: "Alert",
          description: "Temp warning for deletion",
          date: new Date("2024-01-25"),
          userId: testUsers[0].id,
          createdById: testUsers[1].id,
        },
      });

      const token = signAccessToken({
        id: testUsers[1].id,
        email: testUsers[1].email,
        role: testUsers[1].role,
      });

      const res = await request(app)
        .delete(`/warnings/${tempWarning.id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(204);

      // Vérifier que le warning a été supprimé
      const foundWarning = await prisma.warning.findUnique({
        where: { id: tempWarning.id },
      });
      expect(foundWarning).toBeNull();
    });

    it("should return 403 for unauthorized user", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .delete(`/warnings/${testWarnings[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(403);
    });

    it("should return 400 for invalid ID", async () => {
      const token = signAccessToken({
        id: testUsers[1].id,
        email: testUsers[1].email,
        role: testUsers[1].role,
      });

      const res = await request(app)
        .delete("/warnings/invalid")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
    });
  });

  describe("GET /warnings/count", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/warnings/count");
      expect([401, 403]).toContain(res.status);
    });

    it("should return total warning count", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings/count")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /warnings/count/user/:userId", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get(
        `/warnings/count/user/${testUsers[0].id}`
      );
      expect([401, 403]).toContain(res.status);
    });

    it("should return warning count by user", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get(`/warnings/count/user/${testUsers[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /warnings/count/status/:status", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/warnings/count/status/Alert");
      expect([401, 403]).toContain(res.status);
    });

    it("should return warning count by status", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/warnings/count/status/Alert")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });
  });
});
