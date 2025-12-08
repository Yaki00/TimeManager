import { z } from "zod";
import { badRequest } from "../../core/httpErrors.js";

// Schéma pour la création d'un warning
export const CreateWarningSchema = z.object({
  status: z.enum(["Alert", "Late", "UnjustifiedAbsence"], {
    errorMap: () => ({
      message: "Le statut doit être Alert, Late ou UnjustifiedAbsence",
    }),
  }),
  description: z
    .string()
    .min(1)
    .max(500, "La description doit contenir entre 1 et 500 caractères"),
  date: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "Format de date invalide",
  }),
  userId: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive("L'ID utilisateur doit être un entier positif")),
  createdById: z
    .union([z.number(), z.string()])
    .pipe(z.coerce.number().int().positive("L'ID créateur doit être un entier positif"))
    .optional(),
});

// Schéma pour la mise à jour d'un warning
export const UpdateWarningSchema = z.object({
  status: z.enum(["Alert", "Late", "UnjustifiedAbsence"]).optional(),
  description: z.string().min(1).max(500).optional(),
  date: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)))
    .optional(),
});

// Fonction de validation générique
export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    const err = new Error(msg);
    err.status = 400;
    err.statusCode = 400;
    err.code = "BAD_REQUEST";
    throw err;
  }
  return parsed.data;
}

// Middleware de validation pour la création
export function validateCreateWarning(req, _res, next) {
  try {
    req.body = validate(CreateWarningSchema, req.body);
    next();
  } catch (error) {
    next(error);
  }
}

// Middleware de validation pour la mise à jour
export function validateUpdateWarning(req, _res, next) {
  try {
    req.body = validate(UpdateWarningSchema, req.body);
    next();
  } catch (error) {
    next(error);
  }
}

// Validation manuelle pour les paramètres de requête
export function validateWarningId(req, _res, next) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id) || id <= 0) {
    throw badRequest("ID de warning invalide", "WARNING_ID_INVALID");
  }
  req.params.id = id;
  next();
}

export function validateUserId(req, _res, next) {
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId) || userId <= 0) {
    throw badRequest("ID utilisateur invalide", "USER_ID_INVALID");
  }
  req.params.userId = userId;
  next();
}

export function validateWarningStatus(req, _res, next) {
  const status = req.params.status;
  const validStatuses = ["Alert", "Late", "UnjustifiedAbsence"];
  if (!validStatuses.includes(status)) {
    throw badRequest("Statut de warning invalide", "WARNING_STATUS_INVALID");
  }
  next();
}

export function validateDateRange(req, _res, next) {
  const { startDate, endDate } = req.query;

  if (!startDate || (typeof startDate === "string" && startDate.trim() === "") || 
      !endDate || (typeof endDate === "string" && endDate.trim() === "")) {
    throw badRequest(
      "Les dates de début et de fin sont requises",
      "DATE_RANGE_REQUIRED"
    );
  }

  const startDateStr = String(startDate).trim();
  const endDateStr = String(endDate).trim();

  const startDateParsed = Date.parse(startDateStr);
  const endDateParsed = Date.parse(endDateStr);

  if (Number.isNaN(startDateParsed)) {
    throw badRequest("Date de début invalide", "START_DATE_INVALID");
  }

  if (Number.isNaN(endDateParsed)) {
    throw badRequest("Date de fin invalide", "END_DATE_INVALID");
  }

  if (startDateParsed > endDateParsed) {
    throw badRequest(
      "La date de début doit être antérieure à la date de fin",
      "DATE_RANGE_INVALID"
    );
  }

  next();
}

export function validateCreatedById(req, _res, next) {
  const createdById = Number.parseInt(req.params.createdById, 10);
  if (Number.isNaN(createdById) || createdById <= 0) {
    throw badRequest("ID créateur invalide", "CREATED_BY_ID_INVALID");
  }
  req.params.createdById = createdById;
  next();
}
