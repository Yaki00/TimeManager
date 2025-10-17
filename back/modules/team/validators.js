import { badRequest } from "../../core/httpErrors.js";

function isPositiveInt(n) {
  return Number.isInteger(n) && n > 0;
}

export function validateCreateTeam(req, _res, next) {
  const { teamName, description, ownerId, members } = req.body ?? {};

  if (typeof teamName !== "string" || !teamName.trim()) {
    throw badRequest("teamName requis", "TEAM_NAME_REQUIRED");
  }
  if (!isPositiveInt(Number(ownerId))) {
    throw badRequest("ownerId invalide", "OWNER_ID_INVALID");
  }

  if (description != null && typeof description !== "string") {
    throw badRequest("description doit être une chaîne", "DESCRIPTION_INVALID");
  }
  if (members != null) {
    if (!Array.isArray(members)) {
      throw badRequest("members doit être un tableau", "MEMBERS_INVALID");
    }
    for (const m of members) {
      if (!m || !isPositiveInt(Number(m.userId))) {
        throw badRequest("members[].userId invalide", "MEMBER_USER_ID_INVALID");
      }
      if (m.isLead != null && typeof m.isLead !== "boolean") {
        throw badRequest(
          "members[].isLead doit être booléen",
          "MEMBER_IS_LEAD_INVALID"
        );
      }
    }
  }
  req.body = {
    teamName: teamName.trim(),
    description: (description ?? "").trim(),
    ownerId: Number(ownerId),
    members: members ?? [],
  };

  next();
}

export function validateUpdateTeam(req, _res, next) {
  const { teamName, description } = req.body ?? {};
  const patch = {};

  if (teamName != null) {
    if (typeof teamName !== "string" || !teamName.trim()) {
      throw badRequest("teamName invalide", "TEAM_NAME_INVALID");
    }
    patch.teamName = teamName.trim();
  }

  if (description != null) {
    if (typeof description !== "string") {
      throw badRequest("description invalide", "DESCRIPTION_INVALID");
    }
    patch.description = description.trim();
  }
  req.body = patch;
  next();
}
