import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";
import bcrypt from "bcrypt";
import prisma from "../db.js";

describe("User Controller Routes", () => {
  let testUsers;
  let app;

  beforeAll(async () => {
    app = createApp();
    const pw = await bcrypt.hash("Secret123!", 10);

    // Créer des utilisateurs de test
    testUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: "test-employer-controller@example.com" },
        update: {},
        create: {
          email: "test-employer-controller@example.com",
          password: pw,
          firstName: "John",
          lastName: "Doe",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000001",
        },
      }),
      prisma.user.upsert({
        where: { email: "test-manager-controller@example.com" },
        update: {},
        create: {
          email: "test-manager-controller@example.com",
          password: pw,
          firstName: "Jane",
          lastName: "Smith",
          role: "Manager",
          contractType: "H40",
          phoneNumber: "0600000002",
        },
      }),
      prisma.user.upsert({
        where: { email: "test-responsable-controller@example.com" },
        update: {},
        create: {
          email: "test-responsable-controller@example.com",
          password: pw,
          firstName: "Bob",
          lastName: "Johnson",
          role: "Responsable",
          contractType: "H40",
          phoneNumber: "0600000003",
        },
      }),
    ]);
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers.map((u) => u.email),
        },
      },
    });
  });

  describe("GET /users", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users");
      expect([401, 403]).toContain(res.status);
    });

    it("should return users with valid token", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should handle pagination parameters", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users?skip=0&take=10")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /users/:id", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get(`/users/${testUsers[0].id}`);
      expect([401, 403]).toContain(res.status);
    });

    it("should return user by valid ID", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get(`/users/${testUsers[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", testUsers[0].id);
      expect(res.body).toHaveProperty("email", testUsers[0].email);
    });

    it("should return 400 for invalid ID", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/invalid")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent user", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/999999")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
    });
  });

  describe("GET /users/me/info", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users/me/info");
      expect([401, 403]).toContain(res.status);
    });

    it("should return current user", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/me/info")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", testUsers[0].id);
      expect(res.body).toHaveProperty("email", testUsers[0].email);
    });
  });

  describe("GET /users/role/:role", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users/role/Employer");
      expect([401, 403]).toContain(res.status);
    });

    it("should return users by role", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/role/Employer")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 400 for missing role", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/role/")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400); // Bad request for empty role
    });
  });

  describe("GET /users/name/:name", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users/name/John");
      expect([401, 403]).toContain(res.status);
    });

    it("should return users by name", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/name/John")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /users/phone/:phoneNumber", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users/phone/0600000001");
      expect([401, 403]).toContain(res.status);
    });

    it("should return users by phone number", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/phone/0600000001")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /users/contract/:contractType", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users/contract/H35");
      expect([401, 403]).toContain(res.status);
    });

    it("should return users by contract type", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/contract/H35")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("PUT /users/:id", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app)
        .put(`/users/${testUsers[0].id}`)
        .send({ firstName: "Updated" });
      expect([401, 403]).toContain(res.status);
    });

    it("should update user successfully", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .put(`/users/${testUsers[0].id}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({
          firstName: "Updated",
          lastName: "Name",
          phoneNumber: "0600000099",
          contractType: "H40",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("firstName", "Updated");
    });

    it("should return 400 for invalid ID", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .put("/users/invalid")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({ firstName: "Test" });

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /users/:id/role", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app)
        .patch(`/users/${testUsers[0].id}/role`)
        .send({ role: "Manager" });
      expect([401, 403]).toContain(res.status);
    });

    it("should update user role successfully", async () => {
      const token = signAccessToken({
        id: testUsers[2].id, // Responsable token
        email: testUsers[2].email,
        role: testUsers[2].role,
      });

      const res = await request(app)
        .patch(`/users/${testUsers[0].id}/role`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({ role: "Manager" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("role", "Manager");
    });

    it("should return 400 for invalid ID", async () => {
      const token = signAccessToken({
        id: testUsers[2].id,
        email: testUsers[2].email,
        role: testUsers[2].role,
      });

      const res = await request(app)
        .patch("/users/invalid/role")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({ role: "Manager" });

      expect(res.status).toBe(400);
    });

    it("should return 403 when trying to change own role", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .patch(`/users/${testUsers[0].id}/role`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({ role: "Manager" });

      expect(res.status).toBe(403); // Forbidden by middleware
    });

    it("should return 400 for invalid role", async () => {
      const token = signAccessToken({
        id: testUsers[2].id,
        email: testUsers[2].email,
        role: testUsers[2].role,
      });

      const res = await request(app)
        .patch(`/users/${testUsers[0].id}/role`)
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json")
        .send({ role: "InvalidRole" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).delete(`/users/${testUsers[0].id}`);
      expect([401, 403]).toContain(res.status);
    });

    it("should return 400 for invalid ID", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .delete("/users/invalid")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
    });
  });

  describe("GET /users/count", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users/count");
      expect([401, 403]).toContain(res.status);
    });

    it("should return total user count", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/count")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
    });
  });

  describe("GET /users/count/role/:role", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users/count/role/Employer");
      expect([401, 403]).toContain(res.status);
    });

    it("should return user count by role", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/count/role/Employer")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
    });
  });

  describe("GET /users/count/contract/:contractType", () => {
    it("should return 401 without authorization", async () => {
      const res = await request(app).get("/users/count/contract/H35");
      expect([401, 403]).toContain(res.status);
    });

    it("should return user count by contract type", async () => {
      const token = signAccessToken({
        id: testUsers[0].id,
        email: testUsers[0].email,
        role: testUsers[0].role,
      });

      const res = await request(app)
        .get("/users/count/contract/H35")
        .set("Authorization", `Bearer ${token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
      expect(typeof res.body.count).toBe("number");
    });
  });
});
