import {
  createClocking as createClockingSvc,
  findClockingById,
  findAllClockings,
  findClockingsByUserId,
  findClockingsByUserAndDate,
  updateClockingById,
  deleteClockingById,
  getClockingStats,
} from "./service.js";

import { asyncHandler } from "../../core/async.js";
import { badRequest, notFound } from "../../core/httpErrors.js";
import { parsePagination } from "../../core/pagination.js";

export const createClocking = asyncHandler(async (req, res) => {
  const clocking = await createClockingSvc(req.body);
  res.status(201).json(clocking);
});

export const getClockingById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest("ID invalide", "ID_INVALID");
  }

  const clocking = await findClockingById(id);
  if (!clocking) throw notFound("Pointage introuvable", "CLOCKING_NOT_FOUND");

  res.json(clocking);
});

export const listClockings = asyncHandler(async (req, res) => {
  const { skip, take } = parsePagination(req.query, {
    defaultTake: 50,
    maxTake: 200,
  });

  const { userId, startDate, endDate } = req.query;

  const clockings = await findAllClockings({
    skip,
    take,
    userId: userId ? Number(userId) : undefined,
    startDate,
    endDate,
  });

  res.json(clockings);
});

export const listClockingsByUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw badRequest("userId invalide", "USER_ID_INVALID");
  }

  const { skip, take } = parsePagination(req.query, {
    defaultTake: 50,
    maxTake: 200,
  });

  const { startDate, endDate } = req.query;

  const clockings = await findClockingsByUserId(userId, {
    skip,
    take,
    startDate,
    endDate,
  });

  res.json(clockings);
});

export const getClockingsByUserAndDate = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const { date } = req.params;

  if (!Number.isInteger(userId) || userId <= 0) {
    throw badRequest("userId invalide", "USER_ID_INVALID");
  }
  const clockings = await findClockingsByUserAndDate(userId, date);
  res.json(clockings);
});

export const updateClocking = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest("ID invalide", "ID_INVALID");
  }

  const updated = await updateClockingById(id, req.body);
  res.json(updated);
});

export const removeClocking = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest("ID invalide", "ID_INVALID");
  }

  await deleteClockingById(id);
  res.status(204).send();
});

export const getUserClockingStats = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw badRequest("userId invalide", "USER_ID_INVALID");
  }

  const { startDate, endDate } = req.query;

  const stats = await getClockingStats(userId, startDate, endDate);
  res.json(stats);
});
