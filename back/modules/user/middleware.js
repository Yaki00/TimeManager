import { forbidden } from "../../core/httpErrors.js";
import { ROLES } from "../../core/roles.js";

export function requireResponsable(req, _res, next) {
  if (req.user?.role !== ROLES.RESPONSABLE) {
    throw forbidden("Accès refusé : rôle insuffisant", "FORBIDDEN_ROLE");
  }
  next();
}

export function requireManager(req, _res, next) {
  if (req.user?.role !== ROLES.MANAGER) {
    throw forbidden("Accès refusé : rôle insuffisant", "FORBIDDEN_ROLE");
  }
  next();
}

export function requireResponsableOrManager(req, _res, next) {
  if (req.user?.role !== ROLES.RESPONSABLE && req.user?.role !== ROLES.MANAGER) {
    throw forbidden(`Accès refusé : rôle insuffisant ${req.user?.role}`, "FORBIDDEN_ROLE");
  }
  next();
}
