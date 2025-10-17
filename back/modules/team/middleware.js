import prisma from "../../db.js";
import { forbidden, badRequest, notFound } from "../../core/httpErrors.js";
import { ROLES } from "../../core/roles.js";

export async function canManageTeam(req, _res, next) {
  const userId = req.user?.id;
  const role = req.user?.role;
  const teamId = Number(req.params.id ?? req.params.teamId);

  if (!userId) {
    throw badRequest("Utilisateur non authentifié", "NOT_AUTHENTICATED");
  }
  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw badRequest("ID d'équipe invalide", "TEAM_ID_INVALID");
  }
  if (role === ROLES.RESPONSABLE) {
    return next();
  }
  if (role === ROLES.MANAGER) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerId: true },
    });
    if (!team) throw notFound("Équipe introuvable", "TEAM_NOT_FOUND");

    if (team.ownerId === userId) return next();

    throw forbidden(
      "Accès refusé : un Manager ne peut gérer que ses propres équipes",
      "FORBIDDEN_MANAGER_NOT_OWNER"
    );
  }

  throw forbidden("Accès refusé : rôle insuffisant", "FORBIDDEN_ROLE");
}
