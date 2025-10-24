import {
  createWarning as createWarningSvc,
  findWarningById,
  findAllWarnings,
  findWarningsByUserId,
  findWarningsByStatus,
  findWarningsByDateRange,
  findWarningsByCreatedBy,
  updateWarningById,
  deleteWarningById,
  countWarnings,
  countWarningsByUserId,
  countWarningsByStatus,
  countWarningsByDateRange,
  countWarningsByCreatedBy,
} from "./service.js";

import { asyncHandler } from "../../core/async.js";
import { badRequest, notFound, unauthorized } from "../../core/httpErrors.js";
import { parsePagination } from "../../core/pagination.js";

const TEXTS = {
  WARNING_NOT_FOUND: "Warning non trouvé",
  WARNINGS_NOT_FOUND: "Aucun warning trouvé",
  NOT_AUTHENTICATED: "Non authentifié",
  ID_INVALID: "ID invalide",
  USER_ID_INVALID: "ID utilisateur invalide",
  STATUS_INVALID: "Statut invalide",
  DATE_RANGE_INVALID: "Plage de dates invalide",
  CANNOT_CREATE_WARNING_FOR_SELF:
    "Impossible de créer un warning pour soi-même",
  INSUFFICIENT_PERMISSIONS: "Permissions insuffisantes",
};

// Créer un nouveau warning
export const createWarning = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw unauthorized(TEXTS.NOT_AUTHENTICATED, "NOT_AUTHENTICATED");
  }

  const { userId, createdById } = req.body;

  // Empêcher de créer un warning pour soi-même
  if (userId === req.user.id) {
    throw badRequest(
      TEXTS.CANNOT_CREATE_WARNING_FOR_SELF,
      "CANNOT_CREATE_WARNING_FOR_SELF"
    );
  }

  // Utiliser l'ID de l'utilisateur connecté comme créateur si non spécifié
  const warningData = {
    ...req.body,
    createdById: createdById || req.user.id,
  };

  const warning = await createWarningSvc(warningData);
  res.status(201).json(warning);
});

// Récupérer un warning par ID
export const getWarningById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const warning = await findWarningById(id);
  if (!warning) throw notFound(TEXTS.WARNING_NOT_FOUND, "WARNING_NOT_FOUND");

  res.status(200).json(warning);
});

// Récupérer tous les warnings avec pagination
export const getAllWarnings = asyncHandler(async (req, res) => {
  const { skip, take } = parsePagination(req.query, {
    maxTake: 200,
    defaultTake: 50,
  });

  const warnings = await findAllWarnings({ skip, take });
  res.status(200).json(warnings);
});

// Récupérer les warnings d'un utilisateur spécifique
export const getWarningsByUserId = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const { skip, take } = parsePagination(req.query, {
    maxTake: 200,
    defaultTake: 50,
  });

  const warnings = await findWarningsByUserId(userId, { skip, take });
  res.status(200).json(warnings);
});

// Récupérer les warnings par statut
export const getWarningsByStatus = asyncHandler(async (req, res) => {
  const status = req.params.status;
  const { skip, take } = parsePagination(req.query, {
    maxTake: 200,
    defaultTake: 50,
  });

  const warnings = await findWarningsByStatus(status, { skip, take });
  res.status(200).json(warnings);
});

// Récupérer les warnings dans une plage de dates
export const getWarningsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { skip, take } = parsePagination(req.query, {
    maxTake: 200,
    defaultTake: 50,
  });

  if (!startDate || !endDate) {
    throw badRequest(
      "Les dates de début et de fin sont requises",
      "DATE_RANGE_REQUIRED"
    );
  }

  const warnings = await findWarningsByDateRange(startDate, endDate, {
    skip,
    take,
  });
  res.status(200).json(warnings);
});

// Récupérer les warnings créés par un utilisateur
export const getWarningsByCreatedBy = asyncHandler(async (req, res) => {
  const createdById = req.params.createdById;
  const { skip, take } = parsePagination(req.query, {
    maxTake: 200,
    defaultTake: 50,
  });

  const warnings = await findWarningsByCreatedBy(createdById, { skip, take });
  res.status(200).json(warnings);
});

// Mettre à jour un warning
export const updateWarning = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // Vérifier que le warning existe
  const existingWarning = await findWarningById(id);
  if (!existingWarning) {
    throw notFound(TEXTS.WARNING_NOT_FOUND, "WARNING_NOT_FOUND");
  }

  // Vérifier les permissions (seul le créateur ou un manager peut modifier)
  if (!req.user?.id) {
    throw unauthorized(TEXTS.NOT_AUTHENTICATED, "NOT_AUTHENTICATED");
  }

  const canModify =
    existingWarning.createdById === req.user.id ||
    req.user.role === "Manager" ||
    req.user.role === "Responsable";

  if (!canModify) {
    throw unauthorized(
      TEXTS.INSUFFICIENT_PERMISSIONS,
      "INSUFFICIENT_PERMISSIONS"
    );
  }

  const updatedWarning = await updateWarningById(id, req.body);
  res.status(200).json(updatedWarning);
});

// Supprimer un warning
export const deleteWarning = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // Vérifier que le warning existe
  const existingWarning = await findWarningById(id);
  if (!existingWarning) {
    throw notFound(TEXTS.WARNING_NOT_FOUND, "WARNING_NOT_FOUND");
  }

  // Vérifier les permissions (seul le créateur ou un manager peut supprimer)
  if (!req.user?.id) {
    throw unauthorized(TEXTS.NOT_AUTHENTICATED, "NOT_AUTHENTICATED");
  }

  const canDelete =
    existingWarning.createdById === req.user.id ||
    req.user.role === "Manager" ||
    req.user.role === "Responsable";

  if (!canDelete) {
    throw unauthorized(
      TEXTS.INSUFFICIENT_PERMISSIONS,
      "INSUFFICIENT_PERMISSIONS"
    );
  }

  await deleteWarningById(id);
  res.status(204).send();
});

// Compter tous les warnings
export const getCountWarnings = asyncHandler(async (_req, res) => {
  const count = await countWarnings();
  res.status(200).json({ count });
});

// Compter les warnings d'un utilisateur
export const getCountWarningsByUserId = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const count = await countWarningsByUserId(userId);
  res.status(200).json({ count });
});

// Compter les warnings par statut
export const getCountWarningsByStatus = asyncHandler(async (req, res) => {
  const status = req.params.status;
  const count = await countWarningsByStatus(status);
  res.status(200).json({ count });
});

// Compter les warnings dans une plage de dates
export const getCountWarningsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw badRequest(
      "Les dates de début et de fin sont requises",
      "DATE_RANGE_REQUIRED"
    );
  }

  const count = await countWarningsByDateRange(startDate, endDate);
  res.status(200).json({ count });
});

// Compter les warnings créés par un utilisateur
export const getCountWarningsByCreatedBy = asyncHandler(async (req, res) => {
  const createdById = req.params.createdById;
  const count = await countWarningsByCreatedBy(createdById);
  res.status(200).json({ count });
});
