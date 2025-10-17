import request from "supertest";
import prisma from "../db.js";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";

describe("Clocking routes", () => {
  let app;

  // utilisateurs pour les tests
  let employerJohn;
  let managerMike;
  let responsableRita;

  // tokens
  let tokenEmployer;
  let tokenManager;
  let tokenResponsable;

  beforeAll(async () => {
    app = createApp();

    // Récupérer les utilisateurs du setup
    employerJohn = await prisma.user.findUnique({
      where: { email: "john@doe.com" },
      select: { id: true, email: true, role: true },
    });

    managerMike = await prisma.user.findUnique({
      where: { email: "manager@doe.com" },
      select: { id: true, email: true, role: true },
    });

    responsableRita = await prisma.user.findUnique({
      where: { email: "responsable@doe.com" },
      select: { id: true, email: true, role: true },
    });

    // Générer les tokens
    tokenEmployer = signAccessToken({
      id: employerJohn.id,
      email: employerJohn.email,
      role: "Employer",
    });

    tokenManager = signAccessToken({
      id: managerMike.id,
      email: managerMike.email,
      role: "Manager",
    });

    tokenResponsable = signAccessToken({
      id: responsableRita.id,
      email: responsableRita.email,
      role: "Responsable",
    });
  });

  afterAll(async () => {
    // Nettoyer les clockings créés pendant les tests
    await prisma.clocking.deleteMany({
      where: {
        userId: {
          in: [employerJohn.id, managerMike.id, responsableRita.id],
        },
      },
    });
  });

  describe("POST /clockings", () => {
    it("401 sans Authorization", async () => {
      const res = await request(app).post("/clockings").send({});
      expect([401, 403]).toContain(res.status);
    });

    it("201 avec token Employer (peut créer son propre pointage)", async () => {
      const res = await request(app)
        .post("/clockings")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          userId: employerJohn.id,
          clockingDate: "2025-01-15",
          firstArrival: "08:00:00",
          lastDeparture: "17:00:00",
          workMinutes: 480,
          weekDay: "Monday",
          workDay: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe(employerJohn.id);
    });

    it("201 avec token Manager", async () => {
      const res = await request(app)
        .post("/clockings")
        .set("Authorization", `Bearer ${tokenManager}`)
        .send({
          userId: managerMike.id,
          clockingDate: "2025-01-15",
          firstArrival: "09:00:00",
          lastDeparture: "18:00:00",
          workMinutes: 480,
          breakMinutes: 60,
          totalHours: 8,
          weekDay: "Monday",
          workDay: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        userId: managerMike.id,
        workMinutes: 480,
        breakMinutes: 60,
      });
      expect(res.body.id).toBeTruthy();
    });

    it("201 plusieurs pointages par jour autorisés", async () => {
      // Créer un deuxième pointage le même jour
      const res = await request(app)
        .post("/clockings")
        .set("Authorization", `Bearer ${tokenManager}`)
        .send({
          userId: managerMike.id,
          clockingDate: "2025-01-15",
          firstArrival: "14:00:00", // Retour après pause déjeuner
          workMinutes: 240,
          weekDay: "Monday",
          workDay: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe(managerMike.id);
    });

    it("201 avec token Responsable", async () => {
      const res = await request(app)
        .post("/clockings")
        .set("Authorization", `Bearer ${tokenResponsable}`)
        .send({
          userId: employerJohn.id,
          clockingDate: "2025-01-16",
          firstArrival: "08:30:00",
          lastDeparture: "17:30:00",
          workMinutes: 510,
          weekDay: "Tuesday",
          workDay: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe(employerJohn.id);
    });
  });

  describe("GET /clockings", () => {
    it("200 avec token authentifié", async () => {
      const res = await request(app)
        .get("/clockings")
        .set("Authorization", `Bearer ${tokenManager}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("200 avec filtres userId", async () => {
      const res = await request(app)
        .get(`/clockings?userId=${managerMike.id}`)
        .set("Authorization", `Bearer ${tokenManager}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((c) => c.userId === managerMike.id)).toBe(true);
    });
  });

  describe("GET /clockings/user/:userId", () => {
    it("200 pour consulter ses propres pointages", async () => {
      const res = await request(app)
        .get(`/clockings/user/${employerJohn.id}`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("200 pour Responsable consulter n'importe quel utilisateur", async () => {
      const res = await request(app)
        .get(`/clockings/user/${employerJohn.id}`)
        .set("Authorization", `Bearer ${tokenResponsable}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /clockings/user/:userId/stats", () => {
    it("200 avec statistiques calculées", async () => {
      const res = await request(app)
        .get(`/clockings/user/${employerJohn.id}/stats`)
        .set("Authorization", `Bearer ${tokenResponsable}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalWorkMinutes");
      expect(res.body).toHaveProperty("totalBreakMinutes");
      expect(res.body).toHaveProperty("averageWorkMinutes");
      expect(res.body).toHaveProperty("totalDays");
    });
  });

  describe("GET /clockings/user/:userId/date/:date", () => {
    it("200 avec liste des pointages pour une date", async () => {
      const res = await request(app)
        .get(`/clockings/user/${employerJohn.id}/date/2025-01-16`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].userId).toBe(employerJohn.id);
    });

    it("200 avec tableau vide pour une date sans pointage", async () => {
      const res = await request(app)
        .get(`/clockings/user/${employerJohn.id}/date/2025-12-31`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe("PATCH /clockings/:id", () => {
    let clockingId;

    beforeAll(async () => {
      // Créer un pointage pour les tests de mise à jour
      const timeToDateTime = (timeStr) => {
        const [hours, minutes, seconds = "00"] = timeStr.split(":");
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
        return date;
      };

      const clocking = await prisma.clocking.create({
        data: {
          userId: managerMike.id,
          clockingDate: new Date("2025-01-20"),
          firstArrival: timeToDateTime("09:00:00"),
          workMinutes: 480,
          weekDay: "Friday",
          workDay: 5,
        },
      });
      clockingId = clocking.id;
    });

    it("200 pour mettre à jour son propre pointage", async () => {
      const res = await request(app)
        .patch(`/clockings/${clockingId}`)
        .set("Authorization", `Bearer ${tokenManager}`)
        .send({
          lastDeparture: "18:30:00",
          workMinutes: 510,
        });

      expect(res.status).toBe(200);
      expect(res.body.lastDeparture).toBeTruthy(); // Prisma renvoie un DateTime ISO
      expect(res.body.workMinutes).toBe(510);
    });

    it("200 pour Responsable", async () => {
      const res = await request(app)
        .patch(`/clockings/${clockingId}`)
        .set("Authorization", `Bearer ${tokenResponsable}`)
        .send({
          breakMinutes: 45,
        });

      expect(res.status).toBe(200);
      expect(res.body.breakMinutes).toBe(45);
    });

    it("200 pour Employer modifiant uniquement lastDeparture", async () => {
      // Créer un pointage pour l'Employer
      const createRes = await request(app)
        .post("/clockings")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          userId: employerJohn.id,
          clockingDate: "2025-01-17",
          firstArrival: "08:00:00",
          workMinutes: 0,
          weekDay: "Wednesday",
          workDay: 3,
        });

      expect(createRes.status).toBe(201);
      const employerClockingId = createRes.body.id;

      // Modifier uniquement lastDeparture
      const res = await request(app)
        .patch(`/clockings/${employerClockingId}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          lastDeparture: "17:00:00",
        });

      expect(res.status).toBe(200);
      expect(res.body.lastDeparture).toBeTruthy();
    });

    it("403 pour Employer essayant de modifier d'autres champs", async () => {
      // Créer un pointage pour l'Employer
      const createRes = await request(app)
        .post("/clockings")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          userId: employerJohn.id,
          clockingDate: "2025-01-18",
          firstArrival: "08:00:00",
          workMinutes: 480,
          weekDay: "Thursday",
          workDay: 4,
        });

      expect(createRes.status).toBe(201);
      const employerClockingId = createRes.body.id;

      // Tenter de modifier workMinutes (non autorisé)
      const res = await request(app)
        .patch(`/clockings/${employerClockingId}`)
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          workMinutes: 500,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /clockings/:id", () => {
    let clockingToDelete;

    beforeAll(async () => {
      // Créer un pointage à supprimer
      const timeToDateTime = (timeStr) => {
        const [hours, minutes, seconds = "00"] = timeStr.split(":");
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
        return date;
      };

      clockingToDelete = await prisma.clocking.create({
        data: {
          userId: responsableRita.id,
          clockingDate: new Date("2025-01-25"),
          firstArrival: timeToDateTime("08:00:00"),
          workMinutes: 480,
          weekDay: "Wednesday",
          workDay: 3,
        },
      });
    });

    it("200 pour supprimer (Responsable)", async () => {
      const res = await request(app)
        .delete(`/clockings/${clockingToDelete.id}`)
        .set("Authorization", `Bearer ${tokenResponsable}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(clockingToDelete.id);
    });

    it("403 pour Employer essayant de supprimer", async () => {
      // Créer un pointage pour l'Employer
      const createRes = await request(app)
        .post("/clockings")
        .set("Authorization", `Bearer ${tokenEmployer}`)
        .send({
          userId: employerJohn.id,
          clockingDate: "2025-01-19",
          firstArrival: "08:00:00",
          workMinutes: 480,
          weekDay: "Friday",
          workDay: 5,
        });

      expect(createRes.status).toBe(201);
      const employerClockingId = createRes.body.id;

      // Tenter de supprimer (non autorisé)
      const res = await request(app)
        .delete(`/clockings/${employerClockingId}`)
        .set("Authorization", `Bearer ${tokenEmployer}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /clockings/:id", () => {
    it("404 si n'existe pas", async () => {
      const res = await request(app)
        .get("/clockings/99999999")
        .set("Authorization", `Bearer ${tokenManager}`);

      expect(res.status).toBe(404);
    });
  });
});
