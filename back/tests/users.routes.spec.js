import request from "supertest";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";

describe("GET /users", () => {
  it("401 sans Authorization", async () => {
    const app = createApp();
    const res = await request(app).get("/users");
    expect([401, 403]).toContain(res.status);
  });

  it("200 avec token valide", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    console.log("📦 /users RESPONSE", {
      status: res.status,
      headers: res.headers,
      body: res.body,
      text: res.text,
    });

    expect(res.status).toBe(200);

    const users =
      res.body && Object.keys(res.body).length
        ? res.body
        : JSON.parse(res.text || "[]");

    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "john@doe.com",
        }),
      ])
    );
  });
});
