import request from "supertest";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";

describe("Warning Routes", () => {
  it("401 sans Authorization pour GET /warnings", async () => {
    const app = createApp();
    const res = await request(app).get("/warnings");
    expect([401, 403]).toContain(res.status);
  });

  it("200 avec token valide pour GET /warnings", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("401 sans Authorization pour POST /warnings", async () => {
    const app = createApp();
    const res = await request(app).post("/warnings").send({
      status: "Alert",
      description: "Test warning",
      date: "2024-01-20",
      userId: 1,
    });
    expect([401, 403]).toContain(res.status);
  });

  it("403 pour Employer essayant de créer un warning", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .post("/warnings")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({
        status: "Alert",
        description: "Test warning",
        date: "2024-01-20",
        userId: 1,
      });

    expect(res.status).toBe(403);
  });

  it("200 avec token Manager pour POST /warnings", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .post("/warnings")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({
        status: "Alert",
        description: "Test warning from manager",
        date: "2024-01-20",
        userId: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.status).toBe("Alert");
    expect(res.body.description).toBe("Test warning from manager");
  });

  it("200 avec token Responsable pour POST /warnings", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "responsable@doe.com",
      role: "Responsable",
    });

    const res = await request(app)
      .post("/warnings")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({
        status: "Late",
        description: "Test warning from responsable",
        date: "2024-01-21",
        userId: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.status).toBe("Late");
    expect(res.body.description).toBe("Test warning from responsable");
  });

  it("400 pour données invalides dans POST /warnings", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .post("/warnings")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({
        status: "InvalidStatus",
        description: "Test warning",
        date: "2024-01-20",
        userId: 1,
      });

    expect(res.status).toBe(400);
  });

  it("400 pour ID invalide dans GET /warnings/:id", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/invalid")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("404 pour warning inexistant dans GET /warnings/:id", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/999999")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(404);
  });

  it("400 pour userId invalide dans GET /warnings/user/:userId", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/user/invalid")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("400 pour statut invalide dans GET /warnings/status/:status", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/status/InvalidStatus")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("200 pour statut valide dans GET /warnings/status/:status", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/status/Alert")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("200 pour plage de dates valide dans GET /warnings/date-range", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/date-range?startDate=2024-01-01&endDate=2024-01-31")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("400 pour plage de dates invalide dans GET /warnings/date-range", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/date-range?startDate=invalid&endDate=2024-01-31")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("200 pour GET /warnings/count", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/count")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  it("200 pour GET /warnings/count/user/:userId", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/count/user/1")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  it("200 pour GET /warnings/count/status/:status", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/count/status/Alert")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  it("200 pour GET /warnings/count/date-range", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/count/date-range?startDate=2024-01-01&endDate=2024-01-31")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  it("200 pour GET /warnings/count/created-by/:createdById", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/warnings/count/created-by/1")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  it("401 sans Authorization pour PATCH /warnings/:id", async () => {
    const app = createApp();
    const res = await request(app)
      .patch("/warnings/1")
      .send({ description: "Updated" });
    expect([401, 403]).toContain(res.status);
  });

  it("401 sans Authorization pour DELETE /warnings/:id", async () => {
    const app = createApp();
    const res = await request(app).delete("/warnings/1");
    expect([401, 403]).toContain(res.status);
  });

  it("400 pour ID invalide dans PATCH /warnings/:id", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .patch("/warnings/invalid")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({ description: "Updated" });

    expect(res.status).toBe(400);
  });

  it("400 pour ID invalide dans DELETE /warnings/:id", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .delete("/warnings/invalid")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });
});
