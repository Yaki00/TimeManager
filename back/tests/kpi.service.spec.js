import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import {
  getResponsableKPI,
  getManagerKPI,
  getUserKPI,
} from "../modules/kpi/service.js";

describe("KPI Service", () => {
  let testTeam;
  let testTeam2;
  let employer1;
  let employer2;
  let manager1;
  let responsable1;

  beforeAll(async () => {
    const pw = await bcrypt.hash("Secret123!", 10);

    // Créer des utilisateurs de test
    employer1 = await prisma.user.upsert({
      where: { email: "kpi-employer1@test.com" },
      update: {},
      create: {
        email: "kpi-employer1@test.com",
        password: pw,
        firstName: "Alice",
        lastName: "Dupont",
        role: "Employer",
        contractType: "H35",
        phoneNumber: "0600000001",
      },
    });

    employer2 = await prisma.user.upsert({
      where: { email: "kpi-employer2@test.com" },
      update: {},
      create: {
        email: "kpi-employer2@test.com",
        password: pw,
        firstName: "Bob",
        lastName: "Martin",
        role: "Employer",
        contractType: "H40",
        phoneNumber: "0600000002",
      },
    });

    manager1 = await prisma.user.upsert({
      where: { email: "kpi-manager1@test.com" },
      update: {},
      create: {
        email: "kpi-manager1@test.com",
        password: pw,
        firstName: "Sophie",
        lastName: "Manager",
        role: "Manager",
        contractType: "H35",
        phoneNumber: "0600000003",
      },
    });

    responsable1 = await prisma.user.upsert({
      where: { email: "kpi-responsable1@test.com" },
      update: {},
      create: {
        email: "kpi-responsable1@test.com",
        password: pw,
        firstName: "Rita",
        lastName: "Responsable",
        role: "Responsable",
        contractType: "H35",
        phoneNumber: "0600000004",
      },
    });

    // Créer des équipes
    testTeam = await prisma.team.create({
      data: {
        teamName: "Équipe Test KPI",
        description: "Équipe pour les tests KPI",
        ownerId: manager1.id,
      },
    });

    testTeam2 = await prisma.team.create({
      data: {
        teamName: "Équipe Test KPI 2",
        description: "Deuxième équipe pour les tests KPI",
        ownerId: manager1.id,
      },
    });

    // Ajouter les membres aux équipes
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
        {
          teamId: testTeam.id,
          userId: manager1.id,
          isLead: true,
        },
      ],
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await prisma.clocking.deleteMany({
      where: {
        user: {
          email: {
            in: [
              "kpi-employer1@test.com",
              "kpi-employer2@test.com",
              "kpi-manager1@test.com",
              "kpi-responsable1@test.com",
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
              "kpi-employer1@test.com",
              "kpi-employer2@test.com",
              "kpi-manager1@test.com",
              "kpi-responsable1@test.com",
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
              "kpi-employer1@test.com",
              "kpi-employer2@test.com",
              "kpi-manager1@test.com",
              "kpi-responsable1@test.com",
            ],
          },
        },
      },
    });

    await prisma.belongs.deleteMany({
      where: {
        teamId: {
          in: [testTeam.id, testTeam2.id],
        },
      },
    });

    await prisma.team.deleteMany({
      where: {
        id: {
          in: [testTeam.id, testTeam2.id],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            "kpi-employer1@test.com",
            "kpi-employer2@test.com",
            "kpi-manager1@test.com",
            "kpi-responsable1@test.com",
          ],
        },
      },
    });
  });

  describe("getResponsableKPI", () => {
    beforeEach(async () => {
      // Nettoyer les données existantes
      await prisma.leave.deleteMany({
        where: {
          user: {
            email: {
              in: [
                "kpi-employer1@test.com",
                "kpi-employer2@test.com",
                "kpi-manager1@test.com",
                "kpi-responsable1@test.com",
              ],
            },
          },
        },
      });

      // Créer des données de test pour les congés
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      await prisma.leave.createMany({
        data: [
          {
            userId: employer1.id,
            startDate,
            endDate: new Date("2024-01-05"),
            justification: "Vacances",
            status: "Approved",
            daysLeave: 3,
            type: "PaidLeave",
          },
          {
            userId: employer2.id,
            startDate: new Date("2024-01-10"),
            endDate: new Date("2024-01-12"),
            justification: "Maladie",
            status: "Refused",
            daysLeave: 2,
            type: "Absence",
          },
          {
            userId: employer1.id,
            startDate: new Date("2024-01-15"),
            endDate: new Date("2024-01-16"),
            justification: "Personnel",
            status: "Pending",
            daysLeave: 1,
            type: "PaidLeave",
          },
        ],
      });
    });

    it("devrait retourner les KPI pour la vue Responsable", async () => {
      const result = await getResponsableKPI("2024-01-01", "2024-01-31");

      expect(result).toHaveProperty("leaveStats");
      expect(result).toHaveProperty("processingTime");
      expect(result).toHaveProperty("managerRatio");
      expect(result).toHaveProperty("topManagers");
      expect(result).toHaveProperty("topTeams");

      // Vérifier la structure de leaveStats
      expect(Array.isArray(result.leaveStats)).toBe(true);
      expect(result.leaveStats.length).toBeGreaterThan(0);
      result.leaveStats.forEach((stat) => {
        expect(stat).toHaveProperty("name");
        expect(stat).toHaveProperty("value");
        expect(stat).toHaveProperty("color");
      });

      // Vérifier la structure de processingTime
      expect(Array.isArray(result.processingTime)).toBe(true);
      result.processingTime.forEach((item) => {
        expect(item).toHaveProperty("month");
        expect(item).toHaveProperty("days");
      });

      // Vérifier la structure de managerRatio
      expect(Array.isArray(result.managerRatio)).toBe(true);
      result.managerRatio.forEach((ratio) => {
        expect(ratio).toHaveProperty("team");
        expect(ratio).toHaveProperty("ratio");
        expect(typeof ratio.ratio).toBe("number");
      });

      // Vérifier la structure de topManagers
      expect(Array.isArray(result.topManagers)).toBe(true);
      result.topManagers.forEach((manager) => {
        expect(manager).toHaveProperty("name");
        expect(manager).toHaveProperty("score");
        expect(manager).toHaveProperty("team");
        expect(typeof manager.score).toBe("number");
      });

      // Vérifier la structure de topTeams
      expect(Array.isArray(result.topTeams)).toBe(true);
      result.topTeams.forEach((team) => {
        expect(team).toHaveProperty("name");
        expect(team).toHaveProperty("score");
        expect(team).toHaveProperty("topUser");
        expect(typeof team.score).toBe("number");
      });
    });

    it("devrait utiliser les dates par défaut si non fournies", async () => {
      const result = await getResponsableKPI(null, null);
      expect(result).toHaveProperty("leaveStats");
      expect(result).toHaveProperty("processingTime");
    });
  });

  describe("getManagerKPI", () => {
    beforeEach(async () => {
      // Nettoyer les données existantes
      await prisma.clocking.deleteMany({
        where: {
          user: {
            email: {
              in: [
                "kpi-employer1@test.com",
                "kpi-employer2@test.com",
                "kpi-manager1@test.com",
                "kpi-responsable1@test.com",
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
                "kpi-employer1@test.com",
                "kpi-employer2@test.com",
                "kpi-manager1@test.com",
                "kpi-responsable1@test.com",
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
                "kpi-employer1@test.com",
                "kpi-employer2@test.com",
                "kpi-manager1@test.com",
                "kpi-responsable1@test.com",
              ],
            },
          },
        },
      });

      // Créer des pointages
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.clocking.createMany({
        data: [
          {
            userId: employer1.id,
            clockingDate: today,
            firstArrival: new Date("2024-01-01T08:00:00"),
            lastDeparture: new Date("2024-01-01T17:00:00"),
            workTime: 480,
            breakTime: 60,
            totalHours: 8.0,
            weekDay: "Monday",
          },
          {
            userId: employer2.id,
            clockingDate: today,
            firstArrival: new Date("2024-01-01T08:30:00"),
            lastDeparture: new Date("2024-01-01T17:30:00"),
            workTime: 480,
            breakTime: 60,
            totalHours: 8.0,
            weekDay: "Monday",
          },
        ],
      });

      // Créer des congés
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

      // Créer des avertissements
      await prisma.warning.create({
        data: {
          userId: employer2.id,
          status: "Late",
          description: "Retard",
          date: today,
        },
      });
    });

    it("devrait retourner les KPI pour la vue Manager", async () => {
      const result = await getManagerKPI(testTeam.id, null, null);

      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("attendance");
      expect(result).toHaveProperty("teamAttendance");
      expect(result).toHaveProperty("hoursWorked");
      expect(result).toHaveProperty("contractCompliance");
      expect(result).toHaveProperty("warnings");
      expect(result).toHaveProperty("pauseTime");
      expect(result).toHaveProperty("leaveDays");
      expect(result).toHaveProperty("requests");

      // Vérifier la structure de attendance
      expect(Array.isArray(result.attendance)).toBe(true);
      expect(result.attendance.length).toBeGreaterThan(0);
      result.attendance.forEach((item) => {
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("rate");
        expect(typeof item.rate).toBe("number");
        // Le nom doit être juste le prénom (pas le nom complet)
        expect(typeof item.name).toBe("string");
        expect(item.name.split(" ").length).toBe(1); // Un seul mot (prénom)
      });

      // Vérifier teamAttendance
      expect(result.teamAttendance).toHaveProperty("rate");
      expect(typeof result.teamAttendance.rate).toBe("number");

      // Vérifier hoursWorked
      expect(Array.isArray(result.hoursWorked)).toBe(true);
      result.hoursWorked.forEach((item) => {
        expect(item).toHaveProperty("member");
        expect(item).toHaveProperty("hours");
        expect(typeof item.hours).toBe("number");
      });

      // Vérifier contractCompliance
      expect(Array.isArray(result.contractCompliance)).toBe(true);
      result.contractCompliance.forEach((item) => {
        expect(item).toHaveProperty("month");
      });

      // Vérifier warnings
      expect(Array.isArray(result.warnings)).toBe(true);
      result.warnings.forEach((item) => {
        expect(item).toHaveProperty("member");
        expect(item).toHaveProperty("count");
        expect(typeof item.count).toBe("number");
      });

      // Vérifier pauseTime
      expect(Array.isArray(result.pauseTime)).toBe(true);
      result.pauseTime.forEach((item) => {
        expect(item).toHaveProperty("member");
        expect(item).toHaveProperty("minutes");
        expect(typeof item.minutes).toBe("number");
      });

      // Vérifier leaveDays
      expect(Array.isArray(result.leaveDays)).toBe(true);
      result.leaveDays.forEach((item) => {
        expect(item).toHaveProperty("member");
        expect(item).toHaveProperty("days");
        expect(typeof item.days).toBe("number");
      });

      // Vérifier requests
      expect(Array.isArray(result.requests)).toBe(true);
      result.requests.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("member");
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("startDate");
        expect(item).toHaveProperty("endDate");
        expect(item).toHaveProperty("status");
        expect(item).toHaveProperty("reason");
        // Le type doit être mappé en français
        expect(["Congé", "Absence", "Formation", "Télétravail"]).toContain(
          item.type
        );
      });
    });

    it("devrait lancer une erreur si l'équipe n'existe pas", async () => {
      await expect(getManagerKPI(99999, null, null)).rejects.toThrow(
        "Équipe non trouvée"
      );
    });
  });

  describe("getUserKPI", () => {
    beforeEach(async () => {
      // Nettoyer les données existantes
      await prisma.clocking.deleteMany({
        where: {
          userId: employer1.id,
        },
      });

      await prisma.leave.deleteMany({
        where: {
          userId: employer1.id,
        },
      });

      await prisma.warning.deleteMany({
        where: {
          userId: employer1.id,
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Créer des pointages pour différents jours
      const dates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
      }

      await prisma.clocking.createMany({
        data: dates.map((date, index) => ({
          userId: employer1.id,
          clockingDate: date,
          firstArrival: new Date(
            `${date.toISOString().split("T")[0]}T08:00:00`
          ),
          lastDeparture: new Date(
            `${date.toISOString().split("T")[0]}T17:00:00`
          ),
          workTime: 480,
          breakTime: 45,
          totalHours: 8.0,
          weekDay: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][
            index
          ],
        })),
      });

      // Créer des congés
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

      // Créer des avertissements
      await prisma.warning.createMany({
        data: [
          {
            userId: employer1.id,
            status: "Late",
            description: "Retard",
            date: today,
          },
          {
            userId: employer1.id,
            status: "UnjustifiedAbsence",
            description: "Absence",
            date: today,
          },
        ],
      });
    });

    it("devrait retourner les KPI pour la vue Utilisateur", async () => {
      const result = await getUserKPI(employer1.id, null, null);

      expect(result).toHaveProperty("personalAttendance");
      expect(result).toHaveProperty("monthlyHours");
      expect(result).toHaveProperty("arrivalDeparture");
      expect(result).toHaveProperty("contractRate");
      expect(result).toHaveProperty("warningsByType");
      expect(result).toHaveProperty("pauseAverage");
      expect(result).toHaveProperty("leaveDays");
      expect(result).toHaveProperty("absenceDays");

      // Vérifier personalAttendance
      expect(Array.isArray(result.personalAttendance)).toBe(true);
      result.personalAttendance.forEach((item) => {
        expect(item).toHaveProperty("month");
        expect(item).toHaveProperty("rate");
        expect(typeof item.rate).toBe("number");
      });

      // Vérifier monthlyHours
      expect(Array.isArray(result.monthlyHours)).toBe(true);
      result.monthlyHours.forEach((item) => {
        expect(item).toHaveProperty("month");
        expect(item).toHaveProperty("hours");
        expect(typeof item.hours).toBe("number");
      });

      // Vérifier arrivalDeparture
      expect(Array.isArray(result.arrivalDeparture)).toBe(true);
      result.arrivalDeparture.forEach((item) => {
        expect(item).toHaveProperty("day");
        expect(item).toHaveProperty("arrival");
        expect(item).toHaveProperty("departure");
        expect(typeof item.arrival).toBe("number");
        expect(typeof item.departure).toBe("number");
      });

      // Vérifier contractRate
      expect(result.contractRate).toHaveProperty("rate");
      expect(typeof result.contractRate.rate).toBe("number");

      // Vérifier warningsByType
      expect(Array.isArray(result.warningsByType)).toBe(true);
      result.warningsByType.forEach((item) => {
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("count");
        expect(item).toHaveProperty("color");
        expect(typeof item.count).toBe("number");
      });

      // Vérifier pauseAverage
      expect(result.pauseAverage).toHaveProperty("minutes");
      expect(typeof result.pauseAverage.minutes).toBe("number");

      // Vérifier leaveDays
      expect(result.leaveDays).toHaveProperty("average");
      expect(typeof result.leaveDays.average).toBe("number");

      // Vérifier absenceDays
      expect(result.absenceDays).toHaveProperty("average");
      expect(typeof result.absenceDays.average).toBe("number");
    });

    it("devrait lancer une erreur si l'utilisateur n'existe pas", async () => {
      await expect(getUserKPI(99999, null, null)).rejects.toThrow(
        "Utilisateur non trouvé"
      );
    });
  });
});
