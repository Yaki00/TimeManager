import request from "supertest";
import { vi } from "vitest";

vi.mock("../db.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));
import prisma from "../db.js";
import { createApp } from "../server.js";

describe("POST /auth/login", () => {
  it("400 si payload invalide", async () => {
    const app = createApp();
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("200 et token si crédentials OK", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: "john@doe.com",
      password: await (await import("bcrypt")).hash("secret", 10),
      role: "Employer",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "0123456789",
      contractType: "H35",
    });

    const app = createApp();
    const res = await request(app).post("/auth/login").send({
      email: "john@doe.com",
      password: "secret",
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      user: {
        id: expect.any(Number),
        email: "john@doe.com",
        tokens: {
          access: expect.any(String),
          refresh: expect.any(String),
        },
      },
    });
  });
});
