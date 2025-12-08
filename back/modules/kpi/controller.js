import { getResponsableKPI, getManagerKPI, getUserKPI } from "./service.js";
import { asyncHandler } from "../../core/async.js";
import { badRequest, unauthorized, forbidden } from "../../core/httpErrors.js";
import { isManagerOrResponsable } from "../leave/utils.js";
import prisma from "../../db.js";

const TEXTS = {
  PERMISSION_DENIED: "Permission refusée",
  INVALID_DATE_RANGE: "Plage de dates invalide",
};

/**
 * GET /kpi/responsable
 * Récupère les KPI pour la vue Responsable
 */
export const getResponsableKPIs = asyncHandler(async (req, res) => {
  if (!isManagerOrResponsable(req.user)) {
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");
  }

  const { startDate, endDate } = req.query;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw badRequest(TEXTS.INVALID_DATE_RANGE, "INVALID_DATE_RANGE");
  }

  const kpis = await getResponsableKPI(startDate, endDate);
  res.json(kpis);
});

/**
 * GET /kpi/manager/:teamId
 * Récupère les KPI pour la vue Manager d'une équipe spécifique
 */
export const getManagerKPIs = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw unauthorized(TEXTS.PERMISSION_DENIED, "PERMISSION_DENIED");
  }

  const teamId = Number(req.params.teamId);
  if (!teamId || isNaN(teamId)) {
    throw badRequest("ID d'équipe invalide", "INVALID_TEAM_ID");
  }

  // Vérifier que l'utilisateur est manager ou responsable, ou qu'il est propriétaire de l'équipe
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        where: { userId: req.user.id },
      },
    },
  });

  if (!team) {
    throw badRequest("Équipe non trouvée", "TEAM_NOT_FOUND");
  }

  if (
    !isManagerOrResponsable(req.user) &&
    team.ownerId !== req.user.id &&
    team.members.length === 0
  ) {
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");
  }

  const { startDate, endDate } = req.query;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw badRequest(TEXTS.INVALID_DATE_RANGE, "INVALID_DATE_RANGE");
  }

  const kpis = await getManagerKPI(teamId, startDate, endDate);
  res.json(kpis);
});

/**
 * GET /kpi/user/:userId
 * Récupère les KPI pour la vue Utilisateur
 */
export const getUserKPIs = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw unauthorized(TEXTS.PERMISSION_DENIED, "PERMISSION_DENIED");
  }

  const userId = Number(req.params.userId);
  if (!userId || isNaN(userId)) {
    throw badRequest("ID d'utilisateur invalide", "INVALID_USER_ID");
  }

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw badRequest("Utilisateur non trouvé", "USER_NOT_FOUND");
  }

  // L'utilisateur ne peut voir que ses propres KPI, sauf s'il est manager ou responsable
  if (req.user.id !== userId && !isManagerOrResponsable(req.user)) {
    throw forbidden(TEXTS.PERMISSION_DENIED, "FORBIDDEN");
  }

  const { startDate, endDate } = req.query;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw badRequest(TEXTS.INVALID_DATE_RANGE, "INVALID_DATE_RANGE");
  }

  const kpis = await getUserKPI(userId, startDate, endDate);
  res.json(kpis);
});

/**
 * GET /kpi/user
 * Récupère les KPI pour l'utilisateur connecté
 */
export const getCurrentUserKPIs = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw unauthorized(TEXTS.PERMISSION_DENIED, "PERMISSION_DENIED");
  }

  const { startDate, endDate } = req.query;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw badRequest(TEXTS.INVALID_DATE_RANGE, "INVALID_DATE_RANGE");
  }

  const kpis = await getUserKPI(req.user.id, startDate, endDate);
  res.json(kpis);
});
