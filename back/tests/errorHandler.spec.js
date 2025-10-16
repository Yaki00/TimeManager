import request from "supertest";
import { createApp } from "../server.js";

describe("errorHandler", () => {
  it("capture les erreurs et renvoie JSON", async () => {
    const app = createApp();
    const res = await request(app).get("/__crash");
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(res.body).toMatchObject({
      status: "error",
      message: expect.any(String),
    });
  });
});
