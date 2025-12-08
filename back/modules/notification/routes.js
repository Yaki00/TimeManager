import express from "express";
import * as notificationController from "./controller.js";
import {
  validateCreateNotification,
  validateUpdateNotification,
  validateNotificationId,
  validateUserId,
  validateNotificationStatus,
} from "./validators.js";
import { requireAuth } from "../auth/middleware.js";
import { requireResponsableOrManager } from "../user/middleware.js";
import { paginationMiddleware } from "../../core/pagination.js";

/**
 * Router pour les routes de notifications
 * Gestion du système de notifications pour informer les utilisateurs
 * des demandes de congé, avertissements, etc.
 */
const router = express.Router();

// Toutes les routes nécessitent une authentification
// Seuls les utilisateurs connectés peuvent accéder aux notifications
router.use(requireAuth);

/**
 * POST /notifications
 * Créer une nouvelle notification
 * Seuls les Managers et Responsables peuvent créer des notifications manuellement
 * Les notifications automatiques (congés, avertissements) sont créées par le système
 */
router.post(
  "/",
  requireResponsableOrManager,
  validateCreateNotification,
  notificationController.createNotification
);

/**
 * GET /notifications
 * Récupérer toutes les notifications avec pagination
 * Accessible à tous les utilisateurs authentifiés
 */
router.get("/", paginationMiddleware(), notificationController.getAllNotifications);

/**
 * GET /notifications/count
 * Compter le nombre total de notifications dans le système
 */
router.get("/count", notificationController.countNotifications);

/**
 * GET /notifications/:id
 * Récupérer une notification spécifique par son ID
 */
router.get(
  "/:id",
  validateNotificationId,
  notificationController.getNotificationById
);

/**
 * GET /notifications/status/:status
 * Récupérer les notifications filtrées par statut (Present, Late, Warning)
 * avec pagination
 */
router.get(
  "/status/:status",
  validateNotificationStatus,
  paginationMiddleware(),
  notificationController.getNotificationsByStatus
);

/**
 * GET /notifications/count/status/:status
 * Compter les notifications par statut
 */
router.get(
  "/count/status/:status",
  validateNotificationStatus,
  notificationController.countNotificationsByStatus
);

/**
 * GET /notifications/user/:userId
 * Récupérer toutes les notifications reçues par un utilisateur spécifique
 * Utile pour afficher les notifications d'un utilisateur sur son tableau de bord
 */
router.get(
  "/user/:userId",
  validateUserId,
  paginationMiddleware(),
  notificationController.getNotificationsByUserId
);

/**
 * GET /notifications/count/user/:userId
 * Compter le nombre total de notifications reçues par un utilisateur
 */
router.get(
  "/count/user/:userId",
  validateUserId,
  notificationController.countNotificationsByUserId
);

/**
 * GET /notifications/unread/:userId
 * Récupérer uniquement les notifications non lues d'un utilisateur
 * Une notification est considérée comme non lue si le champ updatedAt
 * du Receive est égal à createdAt (pas de modification depuis la création)
 */
router.get(
  "/unread/:userId",
  validateUserId,
  paginationMiddleware(),
  notificationController.getUnreadNotificationsByUserId
);

/**
 * GET /notifications/count/unread/:userId
 * Compter les notifications non lues d'un utilisateur
 * Utile pour afficher un badge de notification non lues
 */
router.get(
  "/count/unread/:userId",
  validateUserId,
  notificationController.countUnreadNotificationsByUserId
);

/**
 * POST /notifications/:id/read
 * Marquer une notification comme lue pour l'utilisateur connecté
 * Met à jour le timestamp updatedAt du Receive pour cette notification
 */
router.post(
  "/:id/read",
  validateNotificationId,
  notificationController.markNotificationAsRead
);

/**
 * PATCH /notifications/:id
 * Mettre à jour une notification existante
 * Seuls les Managers et Responsables peuvent modifier les notifications
 * Permet de changer le titre, le message, le statut, les dates ou les destinataires
 */
router.patch(
  "/:id",
  requireResponsableOrManager,
  validateNotificationId,
  validateUpdateNotification,
  notificationController.updateNotification
);

/**
 * DELETE /notifications/:id
 * Supprimer une notification
 * Seuls les Managers et Responsable peuvent supprimer des notifications
 * La suppression est en cascade : les entrées Receive sont aussi supprimées
 */
router.delete(
  "/:id",
  requireResponsableOrManager,
  validateNotificationId,
  notificationController.deleteNotification
);

export default router;
