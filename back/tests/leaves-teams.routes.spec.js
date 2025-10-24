import request from "supertest";
import prisma from "../db.js";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";
import bcrypt from "bcrypt";

describe("GET /leaves/teams/:teamId", () => {
  let managerId, responsableId, employerId, teamId, otherManagerId, otherTeamId;

  beforeAll(async () => {
    // Récupérer les utilisateurs de test
    const manager = await prisma.user.findUnique({
      where: { email: "manager@doe.com" },
      select: { id: true },
    });
    const responsable = await prisma.user.findUnique({
      where: { email: "responsable@doe.com" },
      select: { id: true },
    });
    const employer = await prisma.user.findUnique({
      where: { email: "john@doe.com" },
      select: { id: true },
    });

    if (!manager || !responsable || !employer) {
      throw new Error("Utilisateurs de test introuvables");
    }

    managerId = manager.id;
    responsableId = responsable.id;
    employerId = employer.id;

    // Créer un autre manager pour tester l'isolation des équipes
    const otherManager = await prisma.user.create({
      data: {
        email: "other.manager@doe.com",
        password: await bcrypt.hash("Secret123!", 10),
        firstName: "Other",
        lastName: "Manager",
        role: "Manager",
        contractType: "H35",
        phoneNumber: "0600000003",
      },
    });
    otherManagerId = otherManager.id;

    // Créer une équipe de test
    const team = await prisma.team.create({
      data: {
        teamName: "Test Team",
        description: "Équipe de test",
        ownerId: managerId,
      },
    });
    teamId = team.id;

    // Créer une autre équipe pour tester l'isolation
    const otherTeam = await prisma.team.create({
      data: {
        teamName: "Other Team",
        description: "Autre équipe",
        ownerId: otherManagerId,
      },
    });
    otherTeamId = otherTeam.id;

    // Ajouter l'employer à l'équipe
    await prisma.belongs.create({
      data: {
        teamId: teamId,
        userId: employerId,
      },
    });

    // Créer quelques congés pour l'employer
    await prisma.leave.createMany({
      data: [
        {
          userId: employerId,
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-01-03"),
          justification: "Vacances",
          daysLeave: 3,
          status: "Pending",
          type: "PaidLeave",
        },
        {
          userId: employerId,
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-02"),
          justification: "Maladie",
          daysLeave: 2,
          status: "Approved",
          type: "Absence",
        },
      ],
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await prisma.leave.deleteMany({ where: { userId: employerId } });
    await prisma.belongs.deleteMany({ where: { teamId } });
    await prisma.belongs.deleteMany({ where: { teamId: otherTeamId } });
    await prisma.team.delete({ where: { id: teamId } });
    await prisma.team.delete({ where: { id: otherTeamId } });
    await prisma.user.delete({ where: { id: otherManagerId } });
    await prisma.$disconnect();
  });

  it("403 si utilisateur n'est pas Manager ou Responsable", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: employerId,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get(`/leaves/teams/${teamId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Accès refusé");
  });

  it("200 si utilisateur est Manager - peut voir les congés de son équipe", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: managerId,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .get(`/leaves/teams/${teamId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Vérifier que tous les congés retournés appartiennent à l'équipe
    res.body.forEach((leave) => {
      expect(leave.userId).toBe(employerId);
    });

    // Vérifier la structure des données retournées
    const firstLeave = res.body[0];
    expect(firstLeave).toHaveProperty("id");
    expect(firstLeave).toHaveProperty("startDate");
    expect(firstLeave).toHaveProperty("endDate");
    expect(firstLeave).toHaveProperty("justification");
    expect(firstLeave).toHaveProperty("status");
    expect(firstLeave).toHaveProperty("daysLeave");
    expect(firstLeave).toHaveProperty("userId");
    expect(firstLeave).toHaveProperty("user");

    // Vérifier que les informations utilisateur sont incluses
    expect(firstLeave.user).toHaveProperty("id");
    expect(firstLeave.user).toHaveProperty("firstName");
    expect(firstLeave.user).toHaveProperty("lastName");
    expect(firstLeave.user).toHaveProperty("email");
  });

  it("200 si utilisateur est Responsable", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: responsableId,
      email: "responsable@doe.com",
      role: "Responsable",
    });

    const res = await request(app)
      .get(`/leaves/teams/${teamId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("200 si équipe n'existe pas - retourne tableau vide", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: managerId,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .get("/leaves/teams/99999")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    // Le service retourne un tableau vide si l'équipe n'existe pas
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("200 si Manager accède à une autre équipe - retourne tableau vide", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: managerId,
      email: "manager@doe.com",
      role: "Manager",
    });

    // Le manager essaie d'accéder à l'équipe de l'autre manager
    const res = await request(app)
      .get(`/leaves/teams/${otherTeamId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    // Le service retourne un tableau vide car l'employer n'est pas dans cette équipe
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("200 si Responsable peut voir toutes les équipes", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: responsableId,
      email: "responsable@doe.com",
      role: "Responsable",
    });

    // Le responsable accède à l'équipe de l'autre manager
    const res = await request(app)
      .get(`/leaves/teams/${otherTeamId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    // Le responsable peut voir toutes les équipes (même vide)
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Cette équipe est vide car aucun membre n'a de congés
    expect(res.body.length).toBe(0);
  });
});
