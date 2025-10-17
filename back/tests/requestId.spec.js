import request from "supertest";
import { createApp } from "../server.js";

describe("requestId", () => {
  it("ajoute un X-Request-Id", async () => {
    const app = createApp();
    const res = await request(app).get("/ping");
    expect(res.headers["x-request-id"]).toBeTruthy();
  });
});
