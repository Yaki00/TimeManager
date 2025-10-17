import prisma from "../../db.js";
import { forbidden, badRequest, notFound } from "../../core/httpErrors.js";
import { ROLES } from "../../core/roles.js";

/**
 * Middleware pour vérifier si l'utilisateur peut créer un clocking
 * - Tous les utilisateurs authentifiés peuvent créer leurs propres pointages
 * - Manager/Responsable peuvent créer pour leurs équipes
 */
export async function canCreateClocking(req, _res, next) {
  const userId = req.user?.id;
  const role = req.user?.role;
  const targetUserId = Number(req.body?.userId);

  if (!userId) {
    throw badRequest("Utilisateur non authentifié", "NOT_AUTHENTICATED");
  }

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    throw badRequest("userId invalide", "USER_ID_INVALID");
  }

  // Responsable peut créer pour tout le monde
  if (role === ROLES.RESPONSABLE) {
    return next();
  }

  // Manager peut créer pour son équipe
  if (role === ROLES.MANAGER) {
    // Peut créer pour lui-même
    if (targetUserId === userId) {
      return next();
    }

    // Vérifier si l'utilisateur cible fait partie de son équipe
    const teamMembership = await prisma.belongs.findFirst({
      where: {
        userId: targetUserId,
        team: {
          ownerId: userId,
        },
      },
    });

    if (teamMembership) {
      return next();
    }
  }

  // Employer peut créer uniquement pour lui-même
  if (role === ROLES.EMPLOYER && targetUserId === userId) {
    return next();
  }

  throw forbidden(
    "Accès refusé : vous ne pouvez pas créer ce pointage",
    "FORBIDDEN_CLOCKING_CREATE"
  );
}

/**
 * Middleware pour vérifier si l'utilisateur peut gérer un pointage
 * - Un Employer peut modifier uniquement lastDeparture de ses propres pointages
 * - Un Manager peut voir/modifier/supprimer les pointages de son équipe
 * - Un Responsable peut tout voir/modifier/supprimer
 */
export async function canManageClocking(req, _res, next) {
  const userId = req.user?.id;
  const role = req.user?.role;
  const clockingId = Number(req.params.id);

  if (!userId) {
    throw badRequest("Utilisateur non authentifié", "NOT_AUTHENTICATED");
  }

  if (!Number.isInteger(clockingId) || clockingId <= 0) {
    throw badRequest("ID de pointage invalide", "CLOCKING_ID_INVALID");
  }

  // Responsable peut tout gérer
  if (role === ROLES.RESPONSABLE) {
    return next();
  }

  // Récupérer le pointage
  const clocking = await prisma.clocking.findUnique({
    where: { id: clockingId },
    select: { userId: true },
  });

  if (!clocking) throw notFound("Pointage introuvable", "CLOCKING_NOT_FOUND");

  // Employer peut modifier uniquement ses propres pointages seulement lastDeparture
  if (role === ROLES.EMPLOYER && clocking.userId === userId) {
    if (req.method === "PATCH") {
      const allowedFields = ["lastDeparture"];
      const requestedFields = Object.keys(req.body || {});
      const unauthorizedFields = requestedFields.filter(
        (field) => !allowedFields.includes(field)
      );

      if (unauthorizedFields.length > 0) {
        throw forbidden(
          `Employer ne peut modifier que lastDeparture. Champs non autorisés: ${unauthorizedFields.join(
            ", "
          )}`,
          "FORBIDDEN_EMPLOYER_FIELDS"
        );
      }
    }

    if (req.method === "DELETE") {
      throw forbidden(
        "Employer ne peut pas supprimer de pointages",
        "FORBIDDEN_EMPLOYER_DELETE"
      );
    }

    return next();
  }

  if (role === ROLES.MANAGER) {
    const teamMembership = await prisma.belongs.findFirst({
      where: {
        userId: clocking.userId,
        team: {
          ownerId: userId,
        },
      },
    });

    if (teamMembership) {
      return next();
    }

    if (clocking.userId === userId) {
      return next();
    }
  }

  throw forbidden(
    "Accès refusé : vous ne pouvez pas gérer ce pointage",
    "FORBIDDEN_CLOCKING_ACCESS"
  );
}

export async function canViewUserClockings(req, _res, next) {
  const userId = req.user?.id;
  const role = req.user?.role;
  const targetUserId = Number(req.params.userId);

  if (!userId) {
    throw badRequest("Utilisateur non authentifié", "NOT_AUTHENTICATED");
  }

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    throw badRequest("userId invalide", "USER_ID_INVALID");
  }

  if (role === ROLES.RESPONSABLE) {
    return next();
  }
  if (userId === targetUserId) {
    return next();
  }

  if (role === ROLES.MANAGER) {
    const teamMembership = await prisma.belongs.findFirst({
      where: {
        userId: targetUserId,
        team: {
          ownerId: userId,
        },
      },
    });

    if (teamMembership) {
      return next();
    }
  }

  throw forbidden(
    "Accès refusé : vous ne pouvez pas consulter ces pointages",
    "FORBIDDEN_CLOCKING_VIEW"
  );
}
