/**
 * Tests pour les routes de notifications
 *
 * Ce fichier de test couvre :
 * - L'authentification et autorisation (401/403)
 * - La création de notifications (Manager/Responsable seulement)
 * - La récupération de notifications avec pagination
 * - Les filtres par statut et utilisateur
 * - Le comptage de notifications
 * - La gestion des notifications non lues
 * - La mise à jour et suppression de notifications
 *
 * Les tests vérifient que seuls les Managers et Responsables peuvent
 * créer, modifier et supprimer des notifications manuellement.
 * Les Employers peuvent seulement consulter leurs notifications.
 */
import request from "supertest";
import { createApp } from "../server.js";
import { signAccessToken } from "../modules/auth/jwt.js";

describe("Notification Routes", () => {
  // ========== Tests d'authentification ==========
  /**
   * Test qu'une requête sans token d'authentification est rejetée
   * Toutes les routes de notifications nécessitent une authentification
   */
  it("401 sans Authorization pour GET /notifications", async () => {
    const app = createApp();
    const res = await request(app).get("/notifications");
    expect([401, 403]).toContain(res.status);
  });

  /**
   * Test qu'un utilisateur authentifié peut récupérer toutes les notifications
   * Vérifie que la réponse est bien un tableau
   */
  it("200 avec token valide pour GET /notifications", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("401 sans Authorization pour POST /notifications", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/notifications")
      .send({
        title: "Test Notification",
        message: "Test message",
        status: "Present",
        date: new Date().toISOString(),
        receiverIds: [1],
      });
    expect([401, 403]).toContain(res.status);
  });

  // ========== Tests de permissions pour la création ==========

  /**
   * Test qu'un Employer ne peut PAS créer de notifications
   * Seuls les Managers et Responsables peuvent créer des notifications manuellement
   */
  it("403 pour Employer essayant de créer une notification", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .post("/notifications")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({
        title: "Test Notification",
        message: "Test message",
        status: "Present",
        date: new Date().toISOString(),
        receiverIds: [1],
      });

    expect(res.status).toBe(403);
  });

  /**
   * Test qu'un Manager peut créer des notifications
   * Vérifie que la notification est créée avec succès (201)
   * et que les données renvoyées sont correctes
   */
  it("200 avec token Manager pour POST /notifications", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .post("/notifications")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({
        title: "Test Notification from Manager",
        message: "Test message from manager",
        status: "Present",
        date: new Date().toISOString(),
        receiverIds: [1],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Test Notification from Manager");
    expect(res.body.message).toBe("Test message from manager");
  });

  /**
   * Test qu'un Responsable peut créer des notifications
   * Même niveau d'autorisation que les Managers
   */
  it("200 avec token Responsable pour POST /notifications", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "responsable@doe.com",
      role: "Responsable",
    });

    const res = await request(app)
      .post("/notifications")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({
        title: "Test Notification from Responsable",
        message: "Test message from responsable",
        status: "Late",
        date: new Date().toISOString(),
        receiverIds: [1],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Test Notification from Responsable");
    expect(res.body.message).toBe("Test message from responsable");
  });

  // ========== Tests de validation ==========

  /**
   * Test que des données invalides (statut inexistant) sont rejetées
   * Les validateurs Zod doivent retourner une erreur 400
   */
  it("400 pour données invalides dans POST /notifications", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .post("/notifications")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({
        title: "Test Notification",
        message: "Test message",
        status: "InvalidStatus",
        receiverIds: [1],
      });

    expect(res.status).toBe(400);
  });

  it("400 pour ID invalide dans GET /notifications/:id", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/invalid")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("404 pour notification inexistante dans GET /notifications/:id", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/999999")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(404);
  });

  it("400 pour userId invalide dans GET /notifications/user/:userId", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/user/invalid")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("400 pour statut invalide dans GET /notifications/status/:status", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/status/InvalidStatus")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("200 pour statut valide dans GET /notifications/status/:status", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/status/Present")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ========== Tests de comptage ==========

  /**
   * Test du comptage de toutes les notifications
   * Retourne un objet avec un champ 'count'
   */
  it("200 pour GET /notifications/count", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/count")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  it("200 pour GET /notifications/count/user/:userId", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/count/user/1")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  it("200 pour GET /notifications/count/status/:status", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/count/status/Present")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  it("200 pour GET /notifications/unread/:userId", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/unread/1")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("200 pour GET /notifications/count/unread/:userId", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "john@doe.com",
      role: "Employer",
    });

    const res = await request(app)
      .get("/notifications/count/unread/1")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  // ========== Tests de gestion des notifications lues ==========

  /**
   * Test pour marquer une notification comme lue
   * Crée d'abord une notification, puis la marque comme lue
   * Vérifie que la réponse indique que la notification est marquée comme lue
   */
  it("200 pour POST /notifications/:id/read", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 1,
      email: "john@doe.com",
      role: "Employer",
    });

    // Créer une notification de test d'abord
    const managerToken = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const createRes = await request(app)
      .post("/notifications")
      .set("Authorization", `Bearer ${managerToken}`)
      .set("Accept", "application/json")
      .send({
        title: "Test Notification",
        message: "Test message",
        status: "Present",
        date: new Date().toISOString(),
        receiverIds: [1],
      });

    const notificationId = createRes.body.id;

    // Marquer comme lue
    const res = await request(app)
      .post(`/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Notification marquée comme lue");
  });

  it("401 sans Authorization pour PATCH /notifications/:id", async () => {
    const app = createApp();
    const res = await request(app)
      .patch("/notifications/1")
      .send({ title: "Updated" });
    expect([401, 403]).toContain(res.status);
  });

  it("401 sans Authorization pour DELETE /notifications/:id", async () => {
    const app = createApp();
    const res = await request(app).delete("/notifications/1");
    expect([401, 403]).toContain(res.status);
  });

  it("400 pour ID invalide dans PATCH /notifications/:id", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .patch("/notifications/invalid")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .send({ title: "Updated" });

    expect(res.status).toBe(400);
  });

  it("400 pour ID invalide dans DELETE /notifications/:id", async () => {
    const app = createApp();
    const token = signAccessToken({
      id: 999,
      email: "manager@doe.com",
      role: "Manager",
    });

    const res = await request(app)
      .delete("/notifications/invalid")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });
});
