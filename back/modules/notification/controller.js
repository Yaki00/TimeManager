import asyncHandler from "express-async-handler";
import * as notificationService from "./service.js";
import { notFound, forbidden } from "../../core/httpErrors.js";

export const createNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);
  res.status(201).json(notification);
});

export const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await notificationService.findNotificationById(
    req.params.id
  );
  if (!notification) {
    throw notFound("Notification non trouvée", "NOTIFICATION_NOT_FOUND");
  }
  res.json(notification);
});

export const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.findAllNotifications(
    res.locals.pagination
  );
  res.json(notifications);
});

export const getNotificationsByStatus = asyncHandler(async (req, res) => {
  const notifications = await notificationService.findNotificationsByStatus(
    req.params.status,
    res.locals.pagination
  );
  res.json(notifications);
});

export const getNotificationsByUserId = asyncHandler(async (req, res) => {
  const notifications = await notificationService.findNotificationsByUserId(
    req.params.userId,
    res.locals.pagination
  );
  res.json(notifications);
});

export const getUnreadNotificationsByUserId = asyncHandler(async (req, res) => {
  const notifications =
    await notificationService.findUnreadNotificationsByUserId(
      req.params.userId,
      res.locals.pagination
    );
  res.json(notifications);
});

export const updateNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.findNotificationById(
    req.params.id
  );
  if (!notification) {
    throw notFound("Notification non trouvée", "NOTIFICATION_NOT_FOUND");
  }

  // Seuls les managers et responsables peuvent modifier les notifications
  if (req.user.role !== "Manager" && req.user.role !== "Responsable") {
    throw forbidden(
      "Vous n'êtes pas autorisé à modifier cette notification",
      "FORBIDDEN"
    );
  }

  const updatedNotification = await notificationService.updateNotificationById(
    req.params.id,
    req.body
  );
  res.json(updatedNotification);
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.findNotificationById(
    req.params.id
  );
  if (!notification) {
    throw notFound("Notification non trouvée", "NOTIFICATION_NOT_FOUND");
  }

  await notificationService.markNotificationAsRead(req.params.id, req.user.id);
  res.json({ message: "Notification marquée comme lue" });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.findNotificationById(
    req.params.id
  );
  if (!notification) {
    throw notFound("Notification non trouvée", "NOTIFICATION_NOT_FOUND");
  }

  // Seuls les managers et responsables peuvent supprimer les notifications
  if (req.user.role !== "Manager" && req.user.role !== "Responsable") {
    throw forbidden(
      "Vous n'êtes pas autorisé à supprimer cette notification",
      "FORBIDDEN"
    );
  }

  await notificationService.deleteNotificationById(req.params.id);
  res.status(204).send();
});

export const countNotifications = asyncHandler(async (req, res) => {
  const count = await notificationService.countNotifications();
  res.json({ count });
});

export const countNotificationsByStatus = asyncHandler(async (req, res) => {
  const count = await notificationService.countNotificationsByStatus(
    req.params.status
  );
  res.json({ count });
});

export const countNotificationsByUserId = asyncHandler(async (req, res) => {
  const count = await notificationService.countNotificationsByUserId(
    req.params.userId
  );
  res.json({ count });
});

export const countUnreadNotificationsByUserId = asyncHandler(
  async (req, res) => {
    const count = await notificationService.countUnreadNotificationsByUserId(
      req.params.userId
    );
    res.json({ count });
  }
);
