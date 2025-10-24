import {
  createLeave,
  findLeaveById,
  findAllLeaves,
  findLeavesByUserId,
  findLeavesByTeamId,
  updateLeaveById,
  deleteLeaveById,
  findOverlappingLeave,
} from "./service.js";

import { LeaveSchema, validate } from "./validators.js";
import { asyncHandler } from "../../core/async.js";
import {
  badRequest,
  notFound,
  unauthorized,
  forbidden,
} from "../../core/httpErrors.js";
import { parsePagination } from "../../core/pagination.js";
import {
  toUTCDateOnly,
  computeBusinessDays,
  isManagerOrResponsable,
} from "./utils.js";

const TEXTS = {
  PERMISSION_DENIED: "Permission refusée",
  LEAVE_NOT_FOUND: "Demande de congé non trouvée",
};

/**
 * POST /leaves
 */
export const createNewLeave = asyncHandler(async (req, res) => {
  if (!req.user?.id)
    throw unauthorized(TEXTS.PERMISSION_DENIED, "PERMISSION_DENIED");

  const { startDate, endDate, justification } = validate(LeaveSchema, req.body);

  const start = toUTCDateOnly(new Date(startDate));
  const end = toUTCDateOnly(new Date(endDate));
  if (start > end)
    throw badRequest(
      "La date de début doit précéder la date de fin",
      "INVALID_DATES"
    );

  const daysLeave = computeBusinessDays(start, end);
  if (daysLeave <= 0)
    throw badRequest(
      "La période ne contient aucun jour ouvré",
      "NO_BUSINESS_DAYS"
    );

  // Un seul congé/absence par jour
  const overlap = await findOverlappingLeave(req.user.id, start, end);
  if (overlap) {
    throw badRequest(
      "Vous avez déjà une demande de congé/absence sur cette période.",
      "OVERLAP"
    );
  }

  const leave = await createLeave({
    startDate: start,
    endDate: end,
    justification: justification.trim(),
    daysLeave,
    userId: req.user.id,
  });

  res.status(201).json(leave);
});

/**
 * GET /leaves/:id
 */
export const getLeave = asyncHandler(async (req, res) => {
  if (!req.user?.id)
    throw unauthorized(TEXTS.PERMISSION_DENIED, "PERMISSION_DENIED");

  const id = Number(req.params.id);
  const leave = await findLeaveById(id);
  if (!leave) throw notFound(TEXTS.LEAVE_NOT_FOUND, "LEAVE_NOT_FOUND");

  if (leave.userId !== req.user.id && !isManagerOrResponsable(req.user)) {
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");
  }

  res.json(leave);
});

/**
 * GET /leaves
 */
export const listLeaves = asyncHandler(async (req, res) => {
  if (!isManagerOrResponsable(req.user))
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");

  const { skip, take } = parsePagination(req.query);
  const leaves = await findAllLeaves({ skip, take });
  res.json(leaves);
});

/**
 * GET /leaves/users/:userId
 */
export const listLeavesByUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  if (req.user?.id !== userId && !isManagerOrResponsable(req.user)) {
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");
  }
  const leaves = await findLeavesByUserId(userId);
  res.json(leaves);
});

/**
 * GET /leaves/teams/:teamId
 */
export const listLeavesByTeam = asyncHandler(async (req, res) => {
  if (!isManagerOrResponsable(req.user))
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");
  const teamId = Number(req.params.teamId);
  const leaves = await findLeavesByTeamId(teamId);
  res.json(leaves);
});

/**
 * PATCH /leaves/:id
 */
export const updateLeave = asyncHandler(async (req, res) => {
  if (!req.user?.id)
    throw unauthorized(TEXTS.PERMISSION_DENIED, "PERMISSION_DENIED");

  const id = Number(req.params.id);
  const current = await findLeaveById(id);
  if (!current) throw notFound(TEXTS.LEAVE_NOT_FOUND, "LEAVE_NOT_FOUND");

  const isOwner = current.userId === req.user.id;
  if (!isOwner && !isManagerOrResponsable(req.user)) {
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");
  }
  if (isOwner && current.status !== "EnAttente") {
    throw badRequest(
      "Impossible de modifier une demande non 'EnAttente'.",
      "INVALID_STATE"
    );
  }

  const start = req.body.startDate
    ? toUTCDateOnly(new Date(req.body.startDate))
    : current.startDate;
  const end = req.body.endDate
    ? toUTCDateOnly(new Date(req.body.endDate))
    : current.endDate;
  const justification = (
    req.body.justification ?? current.justification
  ).trim();

  if (start > end)
    throw badRequest(
      "La date de début doit précéder la date de fin",
      "INVALID_DATES"
    );

  const daysLeave = computeBusinessDays(start, end);
  if (daysLeave <= 0)
    throw badRequest(
      "La période ne contient aucun jour ouvré",
      "NO_BUSINESS_DAYS"
    );

  const overlap = await findOverlappingLeave(current.userId, start, end, id);
  if (overlap) {
    throw badRequest(
      "Vous avez déjà une demande de congé/absence sur cette période.",
      "OVERLAP"
    );
  }

  const updated = await updateLeaveById(id, {
    startDate: start,
    endDate: end,
    justification,
    daysLeave,
  });

  res.json(updated);
});

/**
 * PATCH /leaves/:id/status
 */
export const setLeaveStatus = asyncHandler(async (req, res) => {
  if (!isManagerOrResponsable(req.user))
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");

  const id = Number(req.params.id);
  const { status } = req.body;

  if (!status || !["Accepte", "Refuse"].includes(status)) {
    throw badRequest(
      "Statut invalide (Accepte ou Refuse attendu).",
      "INVALID_STATUS"
    );
  }

  const current = await findLeaveById(id);
  if (!current) throw notFound(TEXTS.LEAVE_NOT_FOUND, "LEAVE_NOT_FOUND");
  if (current.status !== "EnAttente") {
    throw badRequest(
      "Seules les demandes 'EnAttente' peuvent être traitées.",
      "INVALID_STATE"
    );
  }

  const updated = await updateLeaveById(id, { status });
  res.json(updated);
});

/**
 * DELETE /leaves/:id
 */
export const removeLeave = asyncHandler(async (req, res) => {
  if (!req.user?.id)
    throw unauthorized(TEXTS.PERMISSION_DENIED, "PERMISSION_DENIED");

  const id = Number(req.params.id);
  const current = await findLeaveById(id);
  if (!current) throw notFound(TEXTS.LEAVE_NOT_FOUND, "LEAVE_NOT_FOUND");

  const isOwner = current.userId === req.user.id;
  if (!isOwner && !isManagerOrResponsable(req.user)) {
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");
  }
  if (isOwner && current.status !== "EnAttente") {
    throw badRequest(
      "Impossible de supprimer une demande non 'EnAttente'.",
      "INVALID_STATE"
    );
  }

  await deleteLeaveById(id);
  res.status(204).send();
});
