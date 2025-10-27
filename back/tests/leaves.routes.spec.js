import request from "supertest";
import prisma from "../db.js";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";

describe("POST /leaves", () => {
  let userId;

  beforeAll(async () => {
    const user = await prisma.user.findUnique({
      where: { email: "john@doe.com" },
      select: { id: true },
    });
    if (!user) throw new Error("User john@doe.com introuvable (seed manquant)");
    userId = user.id;
  });

  beforeEach(async () => {
    // Nettoie les leaves de cet utilisateur pour éviter OVERLAP entre runs
    await prisma.leave.deleteMany({ where: { userId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("400 si payload invalide", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: userId,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .post("/leaves")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({}); // manque startDate/endDate/justification

    expect(res.status).toBe(400);
  });

  it("201 si payload OK", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: userId,
      email: "john@doe.com",
      role: "Employer",
    });

    const body = {
      startDate: "2025-01-01",
      endDate: "2025-01-05",
      justification: "vacances",
    };

    const res = await request(app)
      .post("/leaves")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send(body);

    // debug utile si jamais ça replante
    // Debug info removed for production

    expect(res.status).toBe(201);

    const payload =
      res.body && Object.keys(res.body).length
        ? res.body
        : JSON.parse(res.text || "{}");

    expect(payload).toMatchObject({
      userId,
      justification: "vacances",
      status: "Pending",
    });
    expect(payload.daysLeave).toBeGreaterThan(0);
    expect(new Date(payload.startDate).toISOString()).toBe(
      "2025-01-01T00:00:00.000Z"
    );
    expect(new Date(payload.endDate).toISOString()).toBe(
      "2025-01-05T00:00:00.000Z"
    );
  });
});
