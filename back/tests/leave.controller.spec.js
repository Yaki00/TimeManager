import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";

describe("Leave Controller", () => {
  let app;
  let employerJohn;
  let managerMike;
  let responsableRita;
  let testTeam;
  let testLeave;

  // tokens
  let tokenEmployer;
  let tokenManager;
  let tokenResponsable;

  beforeAll(async () => {
    app = createApp();

    // Créer des utilisateurs de test
    const pw = await bcrypt.hash("Secret123!", 10);

    employerJohn = await prisma.user.upsert({
      where: { email: "test-employer@example.com" },
      update: {},
      create: {
        email: "test-employer@example.com",
        password: pw,
        firstName: "John",
        lastName: "Employer",
        role: "Employer",
        contractType: "H35",
        phoneNumber: "0600000001",
      },
    });

    managerMike = await prisma.user.upsert({
      where: { email: "test-manager@example.com" },
      update: {},
      create: {
        email: "test-manager@example.com",
        password: pw,
        firstName: "Mike",
        lastName: "Manager",
        role: "Manager",
        contractType: "H35",
        phoneNumber: "0600000002",
      },
    });

    responsableRita = await prisma.user.upsert({
      where: { email: "test-responsable@example.com" },
      update: {},
      create: {
        email: "test-responsable@example.com",
        password: pw,
        firstName: "Rita",
        lastName: "Responsable",
        role: "Responsable",
        contractType: "H35",
        phoneNumber: "0600000003",
      },
    });

    // Créer une équipe de test
    testTeam = await prisma.team.create({
      data: {
        teamName: "Test Team",
        description: "Test team for leave tests",
        ownerId: managerMike.id,
      },
    });

    // Ajouter l'employé à l'équipe
    await prisma.belongs.create({
      data: {
        teamId: testTeam.id,
        userId: employerJohn.id,
        isLead: false,
      },
    });

    // Générer les tokens
    tokenEmployer = signAccessToken({
      id: employerJohn.id,
      email: employerJohn.email,
      role: employerJohn.role,
    });

    tokenManager = signAccessToken({
      id: managerMike.id,
      email: managerMike.email,
      role: managerMike.role,
    });

    tokenResponsable = signAccessToken({
      id: responsableRita.id,
      email: responsableRita.email,
      role: responsableRita.role,
    });
  });

  beforeEach(async () => {
    // Nettoyer les congés existants
    await prisma.leave.deleteMany({
      where: {
        userId: {
          in: [employerJohn.id, managerMike.id, responsableRita.id],
        },
      },
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await prisma.belongs.deleteMany({
      where: {
        teamId: testTeam.id,
      },
    });
    await prisma.team.delete({
      where: { id: testTeam.id },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [employerJohn.email, managerMike.email, responsableRita.email],
        },
      },
    });
  });

  describe("POST /leaves", () => {
    it("should create leave successfully", async () => {
      const res = await request(app)
        .post("/leaves")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          justification: "Vacances",
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        userId: employerJohn.id,
        justification: "Vacances",
        status: "Pending",
      });
      expect(res.body.daysLeave).toBeGreaterThan(0);
    });

    it("should reject invalid dates (start > end)", async () => {
      const res = await request(app)
        .post("/leaves")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          startDate: "2025-02-05",
          endDate: "2025-02-01",
          justification: "Vacances",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("date de début doit précéder");
    });

    it("should reject weekend-only periods", async () => {
      const res = await request(app)
        .post("/leaves")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          startDate: "2025-02-01", // Samedi
          endDate: "2025-02-02", // Dimanche
          justification: "Vacances",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("aucun jour ouvré");
    });

    it("should reject overlapping leaves", async () => {
      // Créer un premier congé
      await request(app)
        .post("/leaves")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          startDate: "2025-02-01",
          endDate: "2025-02-05",
          justification: "Vacances",
        });

      // Essayer de créer un congé qui chevauche
      const res = await request(app)
        .post("/leaves")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          startDate: "2025-02-03",
          endDate: "2025-02-07",
          justification: "Maladie",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("déjà une demande");
    });

    it("should require authentication", async () => {
      const res = await request(app).post("/leaves").send({
        startDate: "2025-02-01",
        endDate: "2025-02-05",
        justification: "Vacances",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /leaves/:id", () => {
    beforeEach(async () => {
      // Créer un congé de test
      testLeave = await prisma.leave.create({
        data: {
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          justification: "Test leave",
          daysLeave: 5,
          userId: employerJohn.id,
          status: "Pending",
          type: "PaidLeave",
        },
      });
    });

    it("should get own leave", async () => {
      const res = await request(app)
        .get(`/leaves/${testLeave.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testLeave.id);
      expect(res.body.userId).toBe(employerJohn.id);
    });

    it("should allow manager to get any leave", async () => {
      const res = await request(app)
        .get(`/leaves/${testLeave.id}`)
        .set("Authorization", `Bearer ${tokenManager}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testLeave.id);
    });

    it("should allow responsable to get any leave", async () => {
      const res = await request(app)
        .get(`/leaves/${testLeave.id}`)
        .set("Authorization", `Bearer ${tokenResponsable}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testLeave.id);
    });

    it("should reject access to other user's leave", async () => {
      // Créer un autre employé
      const otherEmployer = await prisma.user.create({
        data: {
          email: "other@example.com",
          password: await bcrypt.hash("Secret123!", 10),
          firstName: "Other",
          lastName: "Employer",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000004",
        },
      });

      const otherToken = signAccessToken({
        id: otherEmployer.id,
        email: otherEmployer.email,
        role: otherEmployer.role,
      });

      const res = await request(app)
        .get(`/leaves/${testLeave.id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);

      // Nettoyer
      await prisma.user.delete({ where: { id: otherEmployer.id } });
    });

    it("should return 404 for non-existent leave", async () => {
      const res = await request(app)
        .get("/leaves/999999")
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /leaves", () => {
    beforeEach(async () => {
      // Créer quelques congés de test
      await prisma.leave.createMany({
        data: [
          {
            startDate: new Date("2025-02-01"),
            endDate: new Date("2025-02-05"),
            justification: "Leave 1",
            daysLeave: 5,
            userId: employerJohn.id,
            status: "Pending",
            type: "PaidLeave",
          },
          {
            startDate: new Date("2025-03-01"),
            endDate: new Date("2025-03-05"),
            justification: "Leave 2",
            daysLeave: 5,
            userId: managerMike.id,
            status: "Approved",
            type: "PaidLeave",
          },
        ],
      });
    });

    it("should list all leaves for manager", async () => {
      const res = await request(app)
        .get("/leaves")
        .set("Authorization", `Bearer ${tokenManager}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should list all leaves for responsable", async () => {
      const res = await request(app)
        .get("/leaves")
        .set("Authorization", `Bearer ${tokenResponsable}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it("should reject access for employer", async () => {
      const res = await request(app)
        .get("/leaves")
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /leaves/users/:userId", () => {
    beforeEach(async () => {
      await prisma.leave.create({
        data: {
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          justification: "User leave",
          daysLeave: 5,
          userId: employerJohn.id,
          status: "Pending",
          type: "PaidLeave",
        },
      });
    });

    it("should get own leaves", async () => {
      const res = await request(app)
        .get(`/leaves/users/${employerJohn.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should allow manager to get user leaves", async () => {
      const res = await request(app)
        .get(`/leaves/users/${employerJohn.id}`)
        .set("Authorization", `Bearer ${tokenManager}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should reject access to other user's leaves", async () => {
      const otherEmployer = await prisma.user.create({
        data: {
          email: "other2@example.com",
          password: await bcrypt.hash("Secret123!", 10),
          firstName: "Other",
          lastName: "Employer",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000005",
        },
      });

      const otherToken = signAccessToken({
        id: otherEmployer.id,
        email: otherEmployer.email,
        role: otherEmployer.role,
      });

      const res = await request(app)
        .get(`/leaves/users/${employerJohn.id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);

      await prisma.user.delete({ where: { id: otherEmployer.id } });
    });
  });

  describe("GET /leaves/teams/:teamId", () => {
    beforeEach(async () => {
      await prisma.leave.create({
        data: {
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          justification: "Team leave",
          daysLeave: 5,
          userId: employerJohn.id,
          status: "Pending",
          type: "PaidLeave",
        },
      });
    });

    it("should get team leaves for manager", async () => {
      const res = await request(app)
        .get(`/leaves/teams/${testTeam.id}`)
        .set("Authorization", `Bearer ${tokenManager}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should get team leaves for responsable", async () => {
      const res = await request(app)
        .get(`/leaves/teams/${testTeam.id}`)
        .set("Authorization", `Bearer ${tokenResponsable}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should reject access for employer", async () => {
      const res = await request(app)
        .get(`/leaves/teams/${testTeam.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /leaves/:id", () => {
    let leaveToUpdate;

    beforeEach(async () => {
      leaveToUpdate = await prisma.leave.create({
        data: {
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          justification: "Original justification",
          daysLeave: 5,
          userId: employerJohn.id,
          status: "Pending",
          type: "PaidLeave",
        },
      });
    });

    it("should update own leave", async () => {
      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          justification: "Updated justification",
        });

      expect(res.status).toBe(200);
      expect(res.body.justification).toBe("Updated justification");
    });

    it("should update dates", async () => {
      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          startDate: "2025-02-02",
          endDate: "2025-02-06",
        });

      expect(res.status).toBe(200);
      expect(new Date(res.body.startDate).toISOString()).toBe(
        "2025-02-02T00:00:00.000Z"
      );
      expect(new Date(res.body.endDate).toISOString()).toBe(
        "2025-02-06T00:00:00.000Z"
      );
    });

    it("should allow manager to update any leave", async () => {
      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}`)
        .set("Authorization", `Bearer ${tokenManager}`)
        .send({
          justification: "Manager updated",
        });

      expect(res.status).toBe(200);
      expect(res.body.justification).toBe("Manager updated");
    });

    it("should reject update of non-pending leave by owner", async () => {
      // Mettre à jour le statut
      await prisma.leave.update({
        where: { id: leaveToUpdate.id },
        data: { status: "Approved" },
      });

      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          justification: "Should not work",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("non 'EnAttente'");
    });

    it("should reject invalid dates", async () => {
      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          startDate: "2025-02-06",
          endDate: "2025-02-02",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("date de début doit précéder");
    });
  });

  describe("PATCH /leaves/:id/status", () => {
    let leaveToUpdate;

    beforeEach(async () => {
      leaveToUpdate = await prisma.leave.create({
        data: {
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          justification: "Status test leave",
          daysLeave: 5,
          userId: employerJohn.id,
          status: "Pending",
          type: "PaidLeave",
        },
      });
    });

    it("should accept leave", async () => {
      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}/status`)
        .set("Authorization", `Bearer ${tokenManager}`)
        .send({
          status: "Approved",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Approved");
    });

    it("should reject leave", async () => {
      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}/status`)
        .set("Authorization", `Bearer ${tokenManager}`)
        .send({
          status: "Refused",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Refused");
    });

    it("should reject invalid status", async () => {
      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}/status`)
        .set("Authorization", `Bearer ${tokenManager}`)
        .send({
          status: "InvalidStatus",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Statut invalide");
    });

    it("should reject status update for non-pending leave", async () => {
      // Mettre à jour le statut
      await prisma.leave.update({
        where: { id: leaveToUpdate.id },
        data: { status: "Approved" },
      });

      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}/status`)
        .set("Authorization", `Bearer ${tokenManager}`)
        .send({
          status: "Refused",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Seules les demandes 'Pending'");
    });

    it("should reject access for employer", async () => {
      const res = await request(app)
        .patch(`/leaves/${leaveToUpdate.id}/status`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          status: "Approved",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /leaves/:id", () => {
    let leaveToDelete;

    beforeEach(async () => {
      leaveToDelete = await prisma.leave.create({
        data: {
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-05"),
          justification: "Delete test leave",
          daysLeave: 5,
          userId: employerJohn.id,
          status: "Pending",
          type: "PaidLeave",
        },
      });
    });

    it("should delete own leave", async () => {
      const res = await request(app)
        .delete(`/leaves/${leaveToDelete.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(204);

      // Vérifier que le congé a été supprimé
      const deletedLeave = await prisma.leave.findUnique({
        where: { id: leaveToDelete.id },
      });
      expect(deletedLeave).toBeNull();
    });

    it("should allow manager to delete any leave", async () => {
      const res = await request(app)
        .delete(`/leaves/${leaveToDelete.id}`)
        .set("Authorization", `Bearer ${tokenManager}`);

      expect(res.status).toBe(204);
    });

    it("should reject deletion of non-pending leave by owner", async () => {
      // Mettre à jour le statut
      await prisma.leave.update({
        where: { id: leaveToDelete.id },
        data: { status: "Approved" },
      });

      const res = await request(app)
        .delete(`/leaves/${leaveToDelete.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("non 'EnAttente'");
    });

    it("should return 404 for non-existent leave", async () => {
      const res = await request(app)
        .delete("/leaves/999999")
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(404);
    });
  });
});
