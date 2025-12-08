import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";

describe("KPI Controller", () => {
  let app;
  let employer1;
  let employer2;
  let manager1;
  let responsable1;
  let testTeam;

  let tokenEmployer;
  let tokenManager;
  let tokenResponsable;

  beforeAll(async () => {
    app = createApp();

    const pw = await bcrypt.hash("Secret123!", 10);

    // Créer des utilisateurs de test
    employer1 = await prisma.user.upsert({
      where: { email: "kpi-ctrl-employer1@test.com" },
      update: {},
      create: {
        email: "kpi-ctrl-employer1@test.com",
        password: pw,
        firstName: "Alice",
        lastName: "Dupont",
        role: "Employer",
        contractType: "H35",
        phoneNumber: "0600000001",
      },
    });

    employer2 = await prisma.user.upsert({
      where: { email: "kpi-ctrl-employer2@test.com" },
      update: {},
      create: {
        email: "kpi-ctrl-employer2@test.com",
        password: pw,
        firstName: "Bob",
        lastName: "Martin",
        role: "Employer",
        contractType: "H40",
        phoneNumber: "0600000002",
      },
    });

    manager1 = await prisma.user.upsert({
      where: { email: "kpi-ctrl-manager1@test.com" },
      update: {},
      create: {
        email: "kpi-ctrl-manager1@test.com",
        password: pw,
        firstName: "Sophie",
        lastName: "Manager",
        role: "Manager",
        contractType: "H35",
        phoneNumber: "0600000003",
      },
    });

    responsable1 = await prisma.user.upsert({
      where: { email: "kpi-ctrl-responsable1@test.com" },
      update: {},
      create: {
        email: "kpi-ctrl-responsable1@test.com",
        password: pw,
        firstName: "Rita",
        lastName: "Responsable",
        role: "Responsable",
        contractType: "H35",
        phoneNumber: "0600000004",
      },
    });

    // Créer une équipe
    testTeam = await prisma.team.create({
      data: {
        teamName: "Équipe Test KPI Controller",
        description: "Équipe pour les tests KPI Controller",
        ownerId: manager1.id,
      },
    });

    // Ajouter les membres à l'équipe
    await prisma.belongs.createMany({
      data: [
        {
          teamId: testTeam.id,
          userId: employer1.id,
          isLead: false,
        },
        {
          teamId: testTeam.id,
          userId: employer2.id,
          isLead: false,
        },
      ],
    });

    // Générer les tokens
    tokenEmployer = signAccessToken({
      id: employer1.id,
      email: employer1.email,
      role: employer1.role,
    });

    tokenManager = signAccessToken({
      id: manager1.id,
      email: manager1.email,
      role: manager1.role,
    });

    tokenResponsable = signAccessToken({
      id: responsable1.id,
      email: responsable1.email,
      role: responsable1.role,
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await prisma.clocking.deleteMany({
      where: {
        user: {
          email: {
            in: [
              "kpi-ctrl-employer1@test.com",
              "kpi-ctrl-employer2@test.com",
              "kpi-ctrl-manager1@test.com",
              "kpi-ctrl-responsable1@test.com",
            ],
          },
        },
      },
    });

    await prisma.leave.deleteMany({
      where: {
        user: {
          email: {
            in: [
              "kpi-ctrl-employer1@test.com",
              "kpi-ctrl-employer2@test.com",
              "kpi-ctrl-manager1@test.com",
              "kpi-ctrl-responsable1@test.com",
            ],
          },
        },
      },
    });

    await prisma.warning.deleteMany({
      where: {
        user: {
          email: {
            in: [
              "kpi-ctrl-employer1@test.com",
              "kpi-ctrl-employer2@test.com",
              "kpi-ctrl-manager1@test.com",
              "kpi-ctrl-responsable1@test.com",
            ],
          },
        },
      },
    });

    await prisma.belongs.deleteMany({
      where: {
        teamId: testTeam.id,
      },
    });

    await prisma.team.deleteMany({
      where: {
        id: testTeam.id,
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "kpi-ctrl-employer1@test.com",
            "kpi-ctrl-employer2@test.com",
            "kpi-ctrl-manager1@test.com",
            "kpi-ctrl-responsable1@test.com",
          ],
        },
      },
    });
  });

  describe("GET /kpi/responsable", () => {
    beforeEach(async () => {
      // Nettoyer les données existantes
      await prisma.leave.deleteMany({
        where: {
          user: {
            email: {
              in: [
                "kpi-ctrl-employer1@test.com",
                "kpi-ctrl-employer2@test.com",
                "kpi-ctrl-manager1@test.com",
                "kpi-ctrl-responsable1@test.com",
              ],
            },
          },
        },
      });

      // Créer des données de test
      const today = new Date();
      await prisma.leave.create({
        data: {
          userId: employer1.id,
          startDate: today,
          endDate: today,
          justification: "Test",
          status: "Approved",
          daysLeave: 1,
          type: "PaidLeave",
        },
      });
    });

    it("devrait retourner les KPI Responsable pour un responsable", async () => {
      const response = await request(app)
        .get("/kpi/responsable")
        .set("Authorization", `Bearer ${tokenResponsable}`)
        .expect(200);

      expect(response.body).toHaveProperty("leaveStats");
      expect(response.body).toHaveProperty("processingTime");
      expect(response.body).toHaveProperty("managerRatio");
      expect(response.body).toHaveProperty("topManagers");
      expect(response.body).toHaveProperty("topTeams");
    });

    it("devrait retourner les KPI Responsable pour un manager", async () => {
      const response = await request(app)
        .get("/kpi/responsable")
        .set("Authorization", `Bearer ${tokenManager}`)
        .expect(200);

      expect(response.body).toHaveProperty("leaveStats");
    });

    it("devrait refuser l'accès pour un employer", async () => {
      await request(app)
        .get("/kpi/responsable")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .expect(403);
    });

    it("devrait refuser l'accès sans token", async () => {
      await request(app).get("/kpi/responsable").expect(401);
    });

    it("devrait accepter les paramètres de date", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-01-31";

      const response = await request(app)
        .get(`/kpi/responsable?startDate=${startDate}&endDate=${endDate}`)
        .set("Authorization", `Bearer ${tokenResponsable}`)
        .expect(200);

      expect(response.body).toHaveProperty("leaveStats");
    });
  });

  describe("GET /kpi/manager/:teamId", () => {
    beforeEach(async () => {
      // Nettoyer les données existantes
      await prisma.clocking.deleteMany({
        where: {
          user: {
            email: {
              in: [
                "kpi-ctrl-employer1@test.com",
                "kpi-ctrl-employer2@test.com",
                "kpi-ctrl-manager1@test.com",
                "kpi-ctrl-responsable1@test.com",
              ],
            },
          },
        },
      });

      // Créer des données de test
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.clocking.create({
        data: {
          userId: employer1.id,
          clockingDate: today,
          firstArrival: new Date("2024-01-01T08:00:00"),
          lastDeparture: new Date("2024-01-01T17:00:00"),
          workTime: 480,
          breakTime: 60,
          totalHours: 8.0,
          weekDay: "Monday",
        },
      });
    });

    it("devrait retourner les KPI Manager pour un manager propriétaire", async () => {
      const response = await request(app)
        .get(`/kpi/manager/${testTeam.id}`)
        .set("Authorization", `Bearer ${tokenManager}`)
        .expect(200);

      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("attendance");
      expect(response.body).toHaveProperty("teamAttendance");
      expect(response.body).toHaveProperty("hoursWorked");
      expect(response.body).toHaveProperty("contractCompliance");
      expect(response.body).toHaveProperty("warnings");
      expect(response.body).toHaveProperty("pauseTime");
      expect(response.body).toHaveProperty("leaveDays");
      expect(response.body).toHaveProperty("requests");
    });

    it("devrait retourner les KPI Manager pour un responsable", async () => {
      const response = await request(app)
        .get(`/kpi/manager/${testTeam.id}`)
        .set("Authorization", `Bearer ${tokenResponsable}`)
        .expect(200);

      expect(response.body).toHaveProperty("name");
    });

    it("devrait retourner les KPI Manager pour un employer membre de l'équipe", async () => {
      // Ajouter employer1 comme membre de l'équipe (déjà fait dans beforeAll)
      const response = await request(app)
        .get(`/kpi/manager/${testTeam.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .expect(200);

      expect(response.body).toHaveProperty("name");
    });

    it("devrait refuser l'accès pour un employer non membre", async () => {
      // Créer un autre employer qui n'est pas dans l'équipe
      const pw = await bcrypt.hash("Secret123!", 10);
      const otherEmployer = await prisma.user.create({
        data: {
          email: "kpi-ctrl-other@test.com",
          password: pw,
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

      await request(app)
        .get(`/kpi/manager/${testTeam.id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(403);

      // Nettoyer
      await prisma.user.delete({ where: { id: otherEmployer.id } });
    });

    it("devrait retourner 400 si l'équipe n'existe pas", async () => {
      await request(app)
        .get("/kpi/manager/99999")
        .set("Authorization", `Bearer ${tokenManager}`)
        .expect(400);
    });

    it("devrait accepter les paramètres de date", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-01-31";

      const response = await request(app)
        .get(
          `/kpi/manager/${testTeam.id}?startDate=${startDate}&endDate=${endDate}`
        )
        .set("Authorization", `Bearer ${tokenManager}`)
        .expect(200);

      expect(response.body).toHaveProperty("name");
    });
  });

  describe("GET /kpi/user/:userId", () => {
    beforeEach(async () => {
      // Nettoyer les données existantes
      await prisma.clocking.deleteMany({
        where: {
          userId: employer1.id,
        },
      });

      // Créer des données de test
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.clocking.create({
        data: {
          userId: employer1.id,
          clockingDate: today,
          firstArrival: new Date("2024-01-01T08:00:00"),
          lastDeparture: new Date("2024-01-01T17:00:00"),
          workTime: 480,
          breakTime: 45,
          totalHours: 8.0,
          weekDay: "Monday",
        },
      });
    });

    it("devrait retourner les KPI Utilisateur pour l'utilisateur lui-même", async () => {
      const response = await request(app)
        .get(`/kpi/user/${employer1.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .expect(200);

      expect(response.body).toHaveProperty("personalAttendance");
      expect(response.body).toHaveProperty("monthlyHours");
      expect(response.body).toHaveProperty("arrivalDeparture");
      expect(response.body).toHaveProperty("contractRate");
      expect(response.body).toHaveProperty("warningsByType");
      expect(response.body).toHaveProperty("pauseAverage");
      expect(response.body).toHaveProperty("leaveDays");
      expect(response.body).toHaveProperty("absenceDays");
    });

    it("devrait retourner les KPI Utilisateur pour un manager", async () => {
      const response = await request(app)
        .get(`/kpi/user/${employer1.id}`)
        .set("Authorization", `Bearer ${tokenManager}`)
        .expect(200);

      expect(response.body).toHaveProperty("personalAttendance");
    });

    it("devrait retourner les KPI Utilisateur pour un responsable", async () => {
      const response = await request(app)
        .get(`/kpi/user/${employer1.id}`)
        .set("Authorization", `Bearer ${tokenResponsable}`)
        .expect(200);

      expect(response.body).toHaveProperty("personalAttendance");
    });

    it("devrait refuser l'accès pour un employer essayant d'accéder aux KPI d'un autre", async () => {
      await request(app)
        .get(`/kpi/user/${employer2.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .expect(403);
    });

    it("devrait retourner 400 si l'utilisateur n'existe pas", async () => {
      await request(app)
        .get("/kpi/user/99999")
        .set("Authorization", `Bearer ${tokenManager}`)
        .expect(400);
    });

    it("devrait accepter les paramètres de date", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-01-31";

      const response = await request(app)
        .get(
          `/kpi/user/${employer1.id}?startDate=${startDate}&endDate=${endDate}`
        )
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .expect(200);

      expect(response.body).toHaveProperty("personalAttendance");
    });
  });

  describe("GET /kpi/user", () => {
    beforeEach(async () => {
      // Nettoyer les données existantes
      await prisma.clocking.deleteMany({
        where: {
          userId: employer1.id,
        },
      });

      // Créer des données de test
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.clocking.create({
        data: {
          userId: employer1.id,
          clockingDate: today,
          firstArrival: new Date("2024-01-01T08:00:00"),
          lastDeparture: new Date("2024-01-01T17:00:00"),
          workTime: 480,
          breakTime: 45,
          totalHours: 8.0,
          weekDay: "Monday",
        },
      });
    });

    it("devrait retourner les KPI de l'utilisateur connecté", async () => {
      const response = await request(app)
        .get("/kpi/user")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .expect(200);

      expect(response.body).toHaveProperty("personalAttendance");
      expect(response.body).toHaveProperty("monthlyHours");
      expect(response.body).toHaveProperty("arrivalDeparture");
      expect(response.body).toHaveProperty("contractRate");
      expect(response.body).toHaveProperty("warningsByType");
      expect(response.body).toHaveProperty("pauseAverage");
      expect(response.body).toHaveProperty("leaveDays");
      expect(response.body).toHaveProperty("absenceDays");
    });

    it("devrait refuser l'accès sans token", async () => {
      await request(app).get("/kpi/user").expect(401);
    });

    it("devrait accepter les paramètres de date", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-01-31";

      const response = await request(app)
        .get(`/kpi/user?startDate=${startDate}&endDate=${endDate}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .expect(200);

      expect(response.body).toHaveProperty("personalAttendance");
    });
  });
});
