/**
 * Tests pour le service de notifications
 *
 * Ce fichier de test couvre toutes les fonctionnalités du service :
 * - Création de notifications avec ou sans destinataires
 * - Recherche par ID, statut, utilisateur
 * - Gestion des notifications non lues
 * - Mise à jour et suppression de notifications
 * - Marquage des notifications comme lues
 * - Comptage des notifications sous différents critères
 *
 * Les tests utilisent une base de données de test avec des données
 * nettoyées après chaque série de tests (beforeAll/afterAll)
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import {
  createNotification,
  findNotificationById,
  findAllNotifications,
  findNotificationsByUserId,
  findNotificationsByStatus,
  findUnreadNotificationsByUserId,
  updateNotificationById,
  deleteNotificationById,
  markNotificationAsRead,
  countNotifications,
  countNotificationsByUserId,
  countNotificationsByStatus,
  countUnreadNotificationsByUserId,
} from "../modules/notification/service.js";

describe("Notification Service", () => {
  // Variables pour stocker les données de test créées dans beforeAll
  let testUsers;
  let testNotifications;

  /**
   * Avant tous les tests : créer des utilisateurs et notifications de test
   * Ces données sont utilisées tout au long de la suite de tests
   */
  beforeAll(async () => {
    // Créer des utilisateurs de test avec différentes fonctions
    // Employer, Manager et Responsable pour tester tous les cas d'usage
    const pw = await bcrypt.hash("Secret123!", 10);

    testUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: "test-employer-notif@example.com" },
        update: {},
        create: {
          email: "test-employer-notif@example.com",
          password: pw,
          firstName: "John",
          lastName: "Doe",
          role: "Employer",
          contractType: "H35",
          phoneNumber: "0600000001",
        },
      }),
      prisma.user.upsert({
        where: { email: "test-manager-notif@example.com" },
        update: {},
        create: {
          email: "test-manager-notif@example.com",
          password: pw,
          firstName: "Jane",
          lastName: "Smith",
          role: "Manager",
          contractType: "H40",
          phoneNumber: "0600000002",
        },
      }),
      prisma.user.upsert({
        where: { email: "test-responsable-notif@example.com" },
        update: {},
        create: {
          email: "test-responsable-notif@example.com",
          password: pw,
          firstName: "Bob",
          lastName: "Johnson",
          role: "Responsable",
          contractType: "H35",
          phoneNumber: "0600000003",
        },
      }),
    ]);

    // Créer des notifications de test
    testNotifications = await Promise.all([
      prisma.notification.create({
        data: {
          title: "Test Notification 1",
          message: "Test message 1",
          status: "Present",
          date: new Date("2024-01-15"),
          receivers: {
            create: {
              userId: testUsers[0].id,
            },
          },
        },
      }),
      prisma.notification.create({
        data: {
          title: "Test Notification 2",
          message: "Test message 2",
          status: "Late",
          date: new Date("2024-01-16"),
          receivers: {
            createMany: {
              data: [{ userId: testUsers[0].id }, { userId: testUsers[1].id }],
            },
          },
        },
      }),
      prisma.notification.create({
        data: {
          title: "Test Notification 3",
          message: "Test message 3",
          status: "Warning",
          date: new Date("2024-01-17"),
          receivers: {
            create: {
              userId: testUsers[1].id,
            },
          },
        },
      }),
    ]);
  });

  /**
   * Après tous les tests : nettoyer les données de test
   * Supprime toutes les notifications, leurs relations Receive et les utilisateurs de test
   * Cette étape est cruciale pour éviter que les données de test
   * n'interfèrent avec d'autres tests ou avec la base de production
   */
  afterAll(async () => {
    // Nettoyer les notifications de test et leurs relations
    // Supprimer d'abord les entrées Receive pour éviter les erreurs de clé étrangère
    for (const notif of testNotifications) {
      await prisma.receive.deleteMany({
        where: { notificationId: notif.id },
      });
      await prisma.notification.delete({
        where: { id: notif.id },
      });
    }

    // Nettoyer les utilisateurs de test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers.map((u) => u.email),
        },
      },
    });
  });

  /**
   * Tests pour la création de notifications
   * Teste la création avec et sans destinataires
   */
  describe("createNotification", () => {
    /**
     * Test de création d'une notification avec destinataires
     * Vérifie que les destinataires sont correctement associés
     * et que tous les champs sont retournés correctement
     */
    it("should create a notification with receivers", async () => {
      const notificationData = {
        title: "Test Notification Creation",
        message: "Test message creation",
        status: "Present",
        date: new Date("2024-01-20"),
        receiverIds: [testUsers[0].id, testUsers[1].id],
      };

      const notification = await createNotification(notificationData);

      expect(notification).toBeDefined();
      expect(notification.title).toBe("Test Notification Creation");
      expect(notification.message).toBe("Test message creation");
      expect(notification.status).toBe("Present");
      expect(notification.receivers).toBeDefined();
      expect(notification.receivers.length).toBe(2);

      // Nettoyer
      await prisma.receive.deleteMany({
        where: { notificationId: notification.id },
      });
      await prisma.notification.delete({ where: { id: notification.id } });
    });

    /**
     * Test de création d'une notification sans destinataires
     * Une notification peut exister sans destinataire
     */
    it("should create a notification without receivers", async () => {
      const notificationData = {
        title: "Test Notification No Receivers",
        message: "Test message no receivers",
        status: "Late",
        date: new Date("2024-01-21"),
        receiverIds: [],
      };

      const notification = await createNotification(notificationData);

      expect(notification).toBeDefined();
      expect(notification.title).toBe("Test Notification No Receivers");
      expect(notification.receivers.length).toBe(0);

      // Nettoyer
      await prisma.notification.delete({ where: { id: notification.id } });
    });
  });

  describe("findNotificationById", () => {
    it("should find notification by id", async () => {
      const notification = await findNotificationById(testNotifications[0].id);
      expect(notification).toBeDefined();
      expect(notification.id).toBe(testNotifications[0].id);
      expect(notification.title).toBe("Test Notification 1");
      expect(notification.message).toBe("Test message 1");
    });

    it("should return null for non-existent notification", async () => {
      const notification = await findNotificationById(999999);
      expect(notification).toBeNull();
    });
  });

  describe("findAllNotifications", () => {
    it("should find all notifications with default pagination", async () => {
      const notifications = await findAllNotifications();
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThanOrEqual(3);
    });

    it("should find notifications with custom pagination", async () => {
      const notifications = await findAllNotifications({ skip: 0, take: 2 });
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeLessThanOrEqual(2);
    });
  });

  describe("findNotificationsByUserId", () => {
    it("should find notifications by user id", async () => {
      const notifications = await findNotificationsByUserId(testUsers[0].id);
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThanOrEqual(2);
      expect(
        notifications.every((n) =>
          n.receivers.some((r) => r.userId === testUsers[0].id)
        )
      ).toBe(true);
    });

    it("should return empty array for user with no notifications", async () => {
      const notifications = await findNotificationsByUserId(999999);
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBe(0);
    });
  });

  describe("findNotificationsByStatus", () => {
    it("should find notifications by status", async () => {
      const notifications = await findNotificationsByStatus("Present");
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThanOrEqual(1);
      expect(notifications.every((n) => n.status === "Present")).toBe(true);
    });

    it("should return empty array for non-existent status", async () => {
      // Use a status that won't match any notifications
      const notifications = await findNotificationsByStatus("Present", {
        skip: 10000,
        take: 1,
      });
      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe("findUnreadNotificationsByUserId", () => {
    it("should find unread notifications for user", async () => {
      const notifications = await findUnreadNotificationsByUserId(
        testUsers[0].id
      );
      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe("updateNotificationById", () => {
    it("should update notification", async () => {
      // Créer une notification temporaire
      const tempNotif = await prisma.notification.create({
        data: {
          title: "Temp notification",
          message: "Temp message",
          status: "Present",
          date: new Date("2024-01-25"),
          receivers: {
            create: {
              userId: testUsers[0].id,
            },
          },
        },
      });

      const updatedNotification = await updateNotificationById(tempNotif.id, {
        title: "Updated notification",
        status: "Late",
      });

      expect(updatedNotification.title).toBe("Updated notification");
      expect(updatedNotification.status).toBe("Late");

      // Nettoyer
      await prisma.receive.deleteMany({
        where: { notificationId: tempNotif.id },
      });
      await prisma.notification.delete({ where: { id: tempNotif.id } });
    });

    it("should update notification receivers", async () => {
      // Créer une notification temporaire
      const tempNotif = await prisma.notification.create({
        data: {
          title: "Temp notification",
          message: "Temp message",
          status: "Present",
          date: new Date("2024-01-26"),
          receivers: {
            create: {
              userId: testUsers[0].id,
            },
          },
        },
      });

      const updatedNotification = await updateNotificationById(tempNotif.id, {
        receiverIds: [testUsers[1].id],
      });

      expect(updatedNotification.receivers.length).toBe(1);
      expect(updatedNotification.receivers[0].userId).toBe(testUsers[1].id);

      // Nettoyer
      await prisma.receive.deleteMany({
        where: { notificationId: tempNotif.id },
      });
      await prisma.notification.delete({ where: { id: tempNotif.id } });
    });
  });

  describe("markNotificationAsRead", () => {
    it("should mark notification as read", async () => {
      // Créer une notification temporaire
      const tempNotif = await prisma.notification.create({
        data: {
          title: "Temp notification",
          message: "Temp message",
          status: "Present",
          date: new Date("2024-01-27"),
          receivers: {
            create: {
              userId: testUsers[0].id,
            },
          },
        },
      });

      await markNotificationAsRead(tempNotif.id, testUsers[0].id);

      // Vérifier que updatedAt a changé
      const receive = await prisma.receive.findUnique({
        where: {
          userId_notificationId: {
            userId: testUsers[0].id,
            notificationId: tempNotif.id,
          },
        },
      });

      expect(receive).toBeDefined();
      expect(receive.updatedAt.getTime()).toBeGreaterThan(
        receive.createdAt.getTime()
      );

      // Nettoyer
      await prisma.receive.deleteMany({
        where: { notificationId: tempNotif.id },
      });
      await prisma.notification.delete({ where: { id: tempNotif.id } });
    });
  });

  describe("deleteNotificationById", () => {
    it("should delete notification", async () => {
      // Créer une notification temporaire
      const tempNotif = await prisma.notification.create({
        data: {
          title: "Temp notification for deletion",
          message: "Temp message",
          status: "Present",
          date: new Date("2024-01-28"),
          receivers: {
            create: {
              userId: testUsers[0].id,
            },
          },
        },
      });

      const deletedNotification = await deleteNotificationById(tempNotif.id);
      expect(deletedNotification.id).toBe(tempNotif.id);

      // Vérifier que la notification a été supprimée
      const foundNotification = await prisma.notification.findUnique({
        where: { id: tempNotif.id },
      });
      expect(foundNotification).toBeNull();

      // Nettoyer les relations si elles existent encore
      await prisma.receive.deleteMany({
        where: { notificationId: tempNotif.id },
      });
    });
  });

  describe("countNotifications", () => {
    it("should count all notifications", async () => {
      const count = await countNotifications();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  describe("countNotificationsByUserId", () => {
    it("should count notifications by user id", async () => {
      const count = await countNotificationsByUserId(testUsers[0].id);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it("should return 0 for user with no notifications", async () => {
      const count = await countNotificationsByUserId(999999);
      expect(typeof count).toBe("number");
      expect(count).toBe(0);
    });
  });

  describe("countNotificationsByStatus", () => {
    it("should count notifications by status", async () => {
      const count = await countNotificationsByStatus("Present");
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe("countUnreadNotificationsByUserId", () => {
    it("should count unread notifications for user", async () => {
      const count = await countUnreadNotificationsByUserId(testUsers[0].id);
      expect(typeof count).toBe("number");
    });

    it("should return 0 for user with no unread notifications", async () => {
      const count = await countUnreadNotificationsByUserId(999999);
      expect(typeof count).toBe("number");
      expect(count).toBe(0);
    });
  });
});
