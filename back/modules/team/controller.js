import {
  createTeam as createTeamSvc,
  findTeamById,
  findAllTeams,
  findTeamsByOwnerId,
  updateTeamById,
  deleteTeamById,
} from "./service.js";

import { asyncHandler } from "../../core/async.js";
import { badRequest, notFound } from "../../core/httpErrors.js";
import { parsePagination } from "../../core/pagination.js";

export const createTeam = asyncHandler(async (req, res) => {
  const team = await createTeamSvc(req.body);
  res.status(201).json(team);
});


export const getTeamById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest("ID invalide", "ID_INVALID");
  }
  const team = await findTeamById(id);
  if (!team) throw notFound("Équipe introuvable", "TEAM_NOT_FOUND");
  res.json(team);
});


export const listTeams = asyncHandler(async (req, res) => {
  const { skip, take } = parsePagination(req.query, {
    defaultTake: 50,
    maxTake: 200,
  });
  const teams = await findAllTeams({ skip, take });
  res.json(teams);
});

export const listTeamsByOwner = asyncHandler(async (req, res) => {
  const ownerId = Number(req.params.ownerId);
  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    throw badRequest("ownerId invalide", "OWNER_ID_INVALID");
  }
  const teams = await findTeamsByOwnerId(ownerId);
  res.json(teams);
});


export const updateTeam = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest("ID invalide", "ID_INVALID");
  }
  const updated = await updateTeamById(id, req.body);
  res.json(updated);
});


export const removeTeam = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest("ID invalide", "ID_INVALID");
  }
  await deleteTeamById(id);
  res.status(204).send();
});
