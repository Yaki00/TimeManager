import request from "supertest";
import { createApp } from "../server.js";

describe("Fallback 404", () => {
  it("retourne JSON standardisé", async () => {
    const app = createApp();
    const res = await request(app).get("/route/inconnue");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: "error",
      code: "NOT_FOUND",
      message: "Route introuvable",
    });
  });
});
