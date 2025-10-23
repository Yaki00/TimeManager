import request from "supertest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";

describe("Teams routes", () => {
  let app;

  let employerJohn;
  let managerMike;
  let responsableRita;

  // tokens
  let tokenEmployer;
  let tokenManager;
  let tokenResponsable;

  beforeAll(async () => {
    app = createApp();

    // 1) relire l'employé déjà seedé (john@doe.com) pour obtenir son id
    employerJohn = await prisma.user.findUnique({
      where: { email: "john@doe.com" },
      select: { id: true, email: true, role: true },
    });

    // 2) créer un Manager + un Responsable (si pas existants)
    const pw = await bcrypt.hash("Secret123!", 10);

    managerMike = await prisma.user.upsert({
      where: { email: "manager@doe.com" },
      update: {},
      create: {
        email: "manager@doe.com",
        password: pw,
        firstName: "Mike",
        lastName: "Manager",
        role: "Manager",
        contractType: "H35",
        phoneNumber: "0600000001",
      },
      select: { id: true, email: true, role: true },
    });

    responsableRita = await prisma.user.upsert({
      where: { email: "responsable@doe.com" },
      update: {},
      create: {
        email: "responsable@doe.com",
        password: pw,
        firstName: "Rita",
        lastName: "Boss",
        role: "Responsable",
        contractType: "H35",
        phoneNumber: "0600000002",
      },
      select: { id: true, email: true, role: true },
    });

    // 3) tokens (les routes lisent role + id depuis le JWT)
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
    // Optionnel : nettoyer les teams créées pendant les tests
    // await prisma.team.deleteMany({ where: { ownerId: { in: [managerMike.id, responsableRita.id] } } });
  });

  it("POST /teams -> 401 sans Authorization", async () => {
    const res = await request(app).post("/teams").send({});
    expect([401, 403]).toContain(res.status);
  });

  it("POST /teams -> 403 avec token Employer (pas autorisé à créer)", async () => {
    const res = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${tokenEmployer}`)
      .send({
        teamName: "Team Refusée",
        description: "Créée par employer",
        ownerId: employerJohn.id,
      });

    expect([403, 401]).toContain(res.status);
  });

  it("POST /teams -> 201 avec token Manager (owner = manager)", async () => {
    const res = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${tokenManager}`)
      .send({
        teamName: "Team Manager",
        description: "Créée par le manager",
        ownerId: managerMike.id, // important être owner
        members: [{ userId: employerJohn.id, isLead: false }],
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      teamName: "Team Manager",
      ownerId: managerMike.id,
    });

    // Vérifier qu'il y a bien plusieurs membres
    expect(res.body.members).toBeDefined();
    expect(Array.isArray(res.body.members)).toBe(true);
    expect(res.body.members.length).toBeGreaterThanOrEqual(2); // Au moins owner + 1 membre

    // le manager (owner) doit être membre et lead
    const lead = res.body.members.find((m) => m.isLead === true);
    expect(lead?.user?.id).toBe(managerMike.id);

    // John (employerJohn) doit être membre mais pas lead
    const memberJohn = res.body.members.find(
      (m) => m.user?.id === employerJohn.id
    );
    expect(memberJohn).toBeDefined();
    expect(memberJohn.isLead).toBe(false);
    console.log("Membres créés:", res.body.members);
  });

  it("POST /teams -> 201 avec plusieurs membres", async () => {
    const res = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${tokenResponsable}`)
      .send({
        teamName: "Team Multi-Membres",
        description: "Équipe avec plusieurs membres",
        ownerId: managerMike.id,
        members: [
          { userId: employerJohn.id, isLead: false },
          { userId: responsableRita.id, isLead: true },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.members).toBeDefined();
    expect(res.body.members.length).toBeGreaterThanOrEqual(3); // owner + 2 membres

    // Vérifier que tous les membres sont présents
    const memberIds = res.body.members.map((m) => m.user?.id);
    expect(memberIds).toContain(managerMike.id); // owner
    expect(memberIds).toContain(employerJohn.id); // membre 1
    expect(memberIds).toContain(responsableRita.id); // membre 2

    // Vérifier les rôles de lead
    const leads = res.body.members.filter((m) => m.isLead === true);
    expect(leads.length).toBeGreaterThanOrEqual(2); // owner + Rita
    console.log("Membres créés:", res.body.members);
  });

  it("GET /teams -> 200 et contient au moins une team", async () => {
    const res = await request(app)
      .get("/teams")
      .set("Authorization", `Bearer ${tokenManager}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /teams/owner/:ownerId -> 200 et renvoie les teams du manager", async () => {
    const res = await request(app)
      .get(`/teams/owner/${managerMike.id}`)
      .set("Authorization", `Bearer ${tokenManager}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some(
        (t) => t.ownerId === managerMike.id && t.teamName === "Team Manager"
      )
    ).toBe(true);
  });

  it("PATCH /teams/:id -> 403 pour Manager non-owner", async () => {
    // 1) créer une équipe dont l'owner est John (Employer) via un Responsable
    const createByResp = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${tokenResponsable}`)
      .send({
        teamName: "Team de John",
        description: "Créée par Responsable au nom de John",
        ownerId: employerJohn.id,
      });

    expect(createByResp.status).toBe(201);
    const teamId = createByResp.body.id;

    // 2) Manager (non-owner) tente de modifier -> doit être refusé
    const res = await request(app)
      .patch(`/teams/${teamId}`)
      .set("Authorization", `Bearer ${tokenManager}`)
      .send({ description: "Tentative non autorisée" });

    expect(res.status).toBe(403);
  });

  it("PATCH /teams/:id -> 200 pour Manager owner", async () => {
    // créer une team owned par le manager
    const created = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${tokenManager}`)
      .send({
        teamName: "Team Manager 2",
        description: "Avant update",
        ownerId: managerMike.id,
      });

    expect(created.status).toBe(201);
    const teamId = created.body.id;

    const res = await request(app)
      .patch(`/teams/${teamId}`)
      .set("Authorization", `Bearer ${tokenManager}`)
      .send({ description: "Après update" });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe("Après update");
  });

  it("PATCH /teams/:id -> 200 pour Responsable (global)", async () => {
    // réutilise la team "Team de John"
    const listJohnTeams = await request(app)
      .get(`/teams/owner/${employerJohn.id}`)
      .set("Authorization", `Bearer ${tokenResponsable}`);

    expect(listJohnTeams.status).toBe(200);
    const team = listJohnTeams.body.find((t) => t.teamName === "Team de John");
    expect(team).toBeTruthy();

    const res = await request(app)
      .patch(`/teams/${team.id}`)
      .set("Authorization", `Bearer ${tokenResponsable}`)
      .send({ description: "MAJ par Responsable" });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe("MAJ par Responsable");
  });

  it("DELETE /teams/:id -> 204 pour Responsable", async () => {
    // créer une team à supprimer
    const created = await request(app)
      .post("/teams")
      .set("Authorization", `Bearer ${tokenResponsable}`)
      .send({
        teamName: "Team à supprimer",
        description: "temp",
        ownerId: employerJohn.id,
      });

    expect(created.status).toBe(201);
    const teamId = created.body.id;

    const res = await request(app)
      .delete(`/teams/${teamId}`)
      .set("Authorization", `Bearer ${tokenResponsable}`);

    expect(res.status).toBe(204);
  });

  it("GET /teams/:id -> 404 si n’existe pas", async () => {
    const res = await request(app)
      .get("/teams/99999999")
      .set("Authorization", `Bearer ${tokenManager}`);
    expect(res.status).toBe(404);
  });
});
