import { z } from "zod";
import { badRequest } from "../../core/httpErrors.js";

export const CreateNotificationSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  message: z.string().min(1, "Le message est requis"),
  status: z.enum(["Present", "Late", "Warning"]),
  date: z.string().datetime().optional(),
  receiverIds: z
    .array(z.number().int().positive())
    .min(1, "Au moins un destinataire est requis"),
});

export const UpdateNotificationSchema = z.object({
  title: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  status: z.enum(["Present", "Late", "Warning"]).optional(),
  date: z.string().datetime().optional(),
  receiverIds: z.array(z.number().int().positive()).optional(),
});

export function validateCreateNotification(req, res, next) {
  const result = CreateNotificationSchema.safeParse(req.body);
  if (!result.success) {
    return next(
      badRequest(
        "Données de notification invalides",
        "INVALID_NOTIFICATION_DATA"
      )
    );
  }
  req.body = result.data;
  next();
}

export function validateUpdateNotification(req, res, next) {
  const result = UpdateNotificationSchema.safeParse(req.body);
  if (!result.success) {
    return next(
      badRequest("Données de mise à jour invalides", "INVALID_UPDATE_DATA")
    );
  }
  req.body = result.data;
  next();
}

export function validateNotificationId(req, res, next) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id) || id <= 0) {
    return next(
      badRequest("ID de notification invalide", "INVALID_NOTIFICATION_ID")
    );
  }
  req.params.id = id;
  next();
}

export function validateUserId(req, res, next) {
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId) || userId <= 0) {
    return next(badRequest("ID d'utilisateur invalide", "INVALID_USER_ID"));
  }
  req.params.userId = userId;
  next();
}

export function validateNotificationStatus(req, res, next) {
  const status = req.params.status;
  if (!["Present", "Late", "Warning"].includes(status)) {
    return next(
      badRequest(
        "Statut de notification invalide",
        "INVALID_NOTIFICATION_STATUS"
      )
    );
  }
  req.params.status = status;
  next();
}
