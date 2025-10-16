import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "../server.js";

describe("GET /ping", () => {
  it("retourne 200", async () => {
    const app = createApp();
    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pong: true });
  });
});
